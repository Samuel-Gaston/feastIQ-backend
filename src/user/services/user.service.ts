import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Permission } from "../../roles/schemas/permission.schema";
import { Role } from "../../roles/schemas/role.schema";
import { User } from "../schemas/user.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { CreateUserDto } from "../dtos/create-user.dto";
import * as bcrypt from 'bcryptjs'
import { MailService } from "../../common/mail/mail.service";
import { UpdateUserDto } from "../dtos/update-user.dto";



@Injectable()
export class UserService{
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Role.name)
    private readonly roleModel: Model<Role>,
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<Permission>,

    private readonly mailService: MailService,
  ){}

async createUser(dto: CreateUserDto): Promise<User> {
  const { name,email, password,isVerified, isActive, roleId, permissionIds, customer } = dto;

  const existingUser = await this.userModel.findOne({ email });
  if (existingUser) {
    throw new HttpException("User with this email already exists", HttpStatus.BAD_REQUEST, );
  }

  const existRole = await this.roleModel.findById(roleId);
  if (!existRole) {
    throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
  }

  let permissions: Permission[] = [];
  if (permissionIds && permissionIds.length) {

    permissions = await this.permissionModel.find({
      _id: { $in: permissionIds },
    });

    const foundIds = permissions.map((p) => p._id.toString());
    const missing = permissionIds.filter((id) => !foundIds.includes(id));

    if (missing.length) {
      throw new HttpException(
        `Permissions not found: ${missing.join(', ')}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  if (!password) {
    throw new HttpException('Password is required', HttpStatus.BAD_REQUEST, );
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new this.userModel({
    name: customer?.name || name,
    email,
    password: hashedPassword,
    isVerified: isVerified ?? false,
    isActive: isActive ?? true,
    roles: existRole,
    permissions: permissions,
  });

  const savedUser = await user.save();
  return savedUser;
}


   async findAllUser(): Promise<User[]>{
    const users = await this.userModel.find().populate({path:'roles'}).populate({path:'permissions'});
    if(!users){
      throw new HttpException("Failed to get users", HttpStatus.INTERNAL_SERVER_ERROR)
    }
    return users;
   }


   async findOneUser(id: string): Promise<User>{
    const user = await this.userModel.findOne({_id:id}).populate({path:'roles'}).populate({path:'permissions'})
    if(!user){
      throw new HttpException("Failed to get this user", HttpStatus.BAD_REQUEST)
    }
    return user;
   }

   async DeleteUser(id: string): Promise<User>{
    const user = await this.userModel.findByIdAndDelete({_id:id})
      if(!user){
        throw new HttpException("user not deleted", HttpStatus.BAD_REQUEST)
      }
      return user;
    
   }


   async findUserByEmail(email: string): Promise<User>{
    const user = await this.userModel.findOne({email})
    if(!user){
      throw new HttpException("user with this email can not be found", HttpStatus.BAD_GATEWAY)
    }
    return user;
   }

   async updateUser(id: string, dto: UpdateUserDto): Promise<User>{
    const user = await this.userModel.findByIdAndUpdate({_id:id, dto}, {new:true})
    if(!user){
      throw new HttpException("user can not be updated", HttpStatus.BAD_REQUEST)
    }
    return user;
   }

   async activateUserAccount(userId: string): Promise<void> {
    try {
      const user = await this.userModel.findOne({ _id: userId });
      if (!user) {
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      }
      user.isVerified = true;
      await user.save();
    } catch (e) {
      throw new HttpException(
        `Erreur lors de l'activation du compte utilisateur`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }





}