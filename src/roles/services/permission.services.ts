import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { User } from "../../user/schemas/user.schema";
import { CreatePermissionDTO } from "../dtos/create-permission.dto";
import { Permission } from "../schemas/permission.schema";
import { Model, Types } from "mongoose";
import { AssignPermissionDTO } from "../dtos/assign-role.dto";
import { Role } from "../schemas/role.schema";
import { RevokePermissionDto } from "../dtos/revoke-role.dto";
import { InjectModel } from "@nestjs/mongoose/dist/common/mongoose.decorators";



@Injectable()
export class PermissionService{
    constructor(
      @InjectModel(Permission.name)
        private readonly permissionModel: Model<Permission>,
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
        @InjectModel(Role.name)
        private readonly roleModel: Model<Role>

    ){}

    async createPermission(dto: CreatePermissionDTO){
        const {name, description, code} = dto;

        const permission = await this.permissionModel.findOne({code})
        if(permission){
           throw new HttpException("permission not found", HttpStatus.NOT_FOUND)
        }
        const newPemission = await this.permissionModel.create({
            name,
            description,
            code
        })
        const saved = await newPemission.save();
        return saved;
    }


    async getAllPermissions(): Promise<Permission[]>{
        const permissions = await this.permissionModel.find().populate('roles', 'name description');
        return permissions;
    }

    async assignPermissionsToUser(
    userId: string,
    assignPermissionsDto: AssignPermissionDTO,
        ): Promise<User> {

         const { permissionIds } = assignPermissionsDto;

     // Validate input
     if (!permissionIds || permissionIds.length === 0) {
    throw new HttpException(
      "Permission IDs are required",
      HttpStatus.BAD_REQUEST,
    );
  }

  // Find user
  const user = await this.userModel
    .findById(userId)
    .populate('permissions');

  if (!user) {
    throw new HttpException(
      "User not found",
      HttpStatus.NOT_FOUND,
    );
  }

  if (!user.isActive) {
    throw new HttpException(
      "Impossible to assign permission to an inactive user",
      HttpStatus.BAD_REQUEST,
    );
  }

  // Find permissions
  const permissions = await this.permissionModel.find({
    _id: {
      $in: permissionIds.map(id => new Types.ObjectId(id)),
    },
  });

  // Check missing permissions
  if (permissions.length !== permissionIds.length) {
    const foundIds = permissions.map(p => p._id.toString());
    const missingIds = permissionIds.filter(id => !foundIds.includes(id));

    throw new HttpException(
      {
        message: "Some permissions do not exist",
        missingIds,
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  // Assign permissions (replace existing)
  user.permissions = permissions.map(p => p._id) as any;

  // Save user
  await user.save();

  return user;
}

    async getAllUserPermission(userId:string): Promise<Permission[]>{
      const user = await this.userModel.findById(userId)
       .populate<{ permissions: Permission[] }>('permissions');
      if(!user){
                throw new HttpException("Failed to retrieve permissions", HttpStatus.INTERNAL_SERVER_ERROR);
      }
      return user.permissions;
    }

     async assignPermissionsToRole(
     roleId: string,
    assignPermissionsDto: AssignPermissionDTO
    ): Promise<Role> {

    const { permissionIds } = assignPermissionsDto;

  // Validate input
  if (!permissionIds || permissionIds.length === 0) {
    throw new HttpException(
      "Permission IDs are required",
      HttpStatus.BAD_REQUEST
    );
  }

  // Find role
  const role = await this.roleModel
    .findById(roleId)
    .populate('permissions');

  if (!role) {
    throw new HttpException("Role not found", HttpStatus.NOT_FOUND);
  }

  // Find permissions
  const permissions = await this.permissionModel.find({
    _id: {
      $in: permissionIds.map(id => new Types.ObjectId(id)),
    },
  });

  // Check missing permissions
  if (permissions.length !== permissionIds.length) {
    const foundIds = permissions.map(p => p._id.toString());
    const missingIds = permissionIds.filter(id => !foundIds.includes(id));

    throw new HttpException(
      {
        message: "Some permissions do not exist",
        missingIds,
      },
      HttpStatus.BAD_REQUEST
    );
  }

  // Assign permissions (replace existing)
  role.permissions = permissions.map(p => p._id);

  // Save role
  await role.save();

  return role;
}

    async revokePermissions(
     roleId: string,
     revokePermissionsDto: RevokePermissionDto,
    ): Promise<Role> {

  const { permissionIds } = revokePermissionsDto;

  // Validate input
  if (!permissionIds || permissionIds.length === 0) {
    throw new HttpException(
      "Permission IDs are required",
      HttpStatus.BAD_REQUEST,
    );
  }

  // Find role (populate permissions)
  const role = await this.roleModel
    .findById(roleId)
    .populate<{ permissions: Permission[] }>('permissions');

  if (!role) {
    throw new HttpException(
      `Role with ID "${roleId}" not found`,
      HttpStatus.NOT_FOUND,
    );
  }

  // Prevent modifying system roles
  if (role.isSystem) {
    throw new HttpException(
      "System role permissions cannot be modified",
      HttpStatus.FORBIDDEN,
    );
  }

  // Ensure permissions array exists
  const currentPermissions = role.permissions || [];

  // Get existing permission IDs
  const existingPermissionIds = currentPermissions.map(p =>
    p._id.toString()
  );

  // Check permissions that are not assigned
  const permissionsNotInRole = permissionIds.filter(
    id => !existingPermissionIds.includes(id),
  );

  if (permissionsNotInRole.length > 0) {
    throw new HttpException(
      {
        message: "Some permissions are not assigned to this role",
        permissionsNotInRole,
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  // Remove permissions
  const updatedPermissionIds = existingPermissionIds.filter(
    id => !permissionIds.includes(id),
  );

  role.permissions = updatedPermissionIds.map(id => new Types.ObjectId(id)) as any;

  // Save
  await role.save();

  return role as any;
}
}