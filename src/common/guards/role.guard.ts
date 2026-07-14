import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from '../enums/role.enum';


@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

// roles.guard.ts
canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
        context.getHandler(),
        context.getClass(),
    ]);
    
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user; 

    if (!user) throw new ForbiddenException('User not found');
    
    // In JwtStrategy, you set 'role: user.roles'
    // If user.roles is an array of objects [ { name: 'DOCTOR', ... }, ... ]
    const userRoles = Array.isArray(user.role) ? user.role : [user.role];

    // Debugging: uncomment the line below to see what structure you are actually getting
    // console.log("User Roles from Strategy:", userRoles);

    const hasRole = userRoles.some((role) => {
        // Handle cases where role might be an ID string vs an object with a 'name' property
        const roleName = typeof role === 'object' && role !== null ? role.name : role;
        return requiredRoles.includes(roleName) || roleName === RoleEnum.SUPER_ADMIN;
    });

    if (!hasRole) {
        throw new ForbiddenException('You do not have the required role');
    }
    
    return true;
}
}
