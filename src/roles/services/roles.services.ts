import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { Role } from "../schemas/role.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateRoleDTO } from "../dtos/create-role.dto";
import { Permission } from "../schemas/permission.schema";

@Injectable()
export class RoleService{
    constructor(
        @InjectModel(Role.name)
        private roleModel: Model<Role>,
       
        @InjectModel(Permission.name)
        private permissionModel: Model<Permission>
    ){}
   

async createRole(dto: CreateRoleDTO) {
  const { name, description, permissionIds } = dto;

  const existingRole = await this.roleModel.findOne({ name });

  if (existingRole) {
    throw new HttpException(
      'Role with this name already exists',
      HttpStatus.BAD_REQUEST,
    );
  }

  const role = await this.roleModel.create({
    name,
    description,
    isActive: true,
    isSystem: false,
  });

  // Validate permissions
  if (permissionIds && permissionIds.length > 0) {
    const permissions = await this.permissionModel.find({
      _id: { $in: permissionIds },
    });

    if (permissions.length !== permissionIds.length) {
      throw new HttpException(
        'Some permissions not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    role.permissions = permissions.map(p => p._id); 
  }

  const savedRole = await role.save();
  return savedRole;
}


   async getAllRoles(): Promise<Role[]>{
    const roles = await this.roleModel.find().populate('permissions', 'name description');
    return roles;
   }


   async getRoleById(id:string): Promise<Role>{
    const role = await this.roleModel.findById({
        id:id,
        ref:'permissions'
    })
    if(role){
        return role;
    }
    else{
        throw new Error("Role not found");
    }
   }



   async getPermissionsForRole(roleId:string): Promise<Role>{
    const role = await this.roleModel.findById(roleId).populate('permissions', 'name')
    if(role){
        return role;
    }
    else{
        throw new Error("failed to fetched permissions by role")
    }
   }


   async updateRole(id:string, dto:CreateRoleDTO){
    const {name,description} = dto;
    const role = await this.roleModel.findById(id);
    if(!role){
        throw new Error("Role not found");
    }
     await this.roleModel.findByIdAndUpdate(id, {
        name, description
    },{new:true})

  
   }


   async remove(id:string): Promise<void>{
    const role = await this.roleModel.findById(id);
    if(!role){
        throw new Error("Role not found");
    }

    await this.roleModel.findByIdAndDelete(id);
  
    
   }

}