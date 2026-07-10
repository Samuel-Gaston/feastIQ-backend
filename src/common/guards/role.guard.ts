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

 canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
        context.getHandler(),
        context.getClass(),
    ]);
    
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user; // This is the object returned by JwtStrategy.validate()

    if (!user) throw new ForbiddenException('User not found');
    
    // Check if user.role exists and is an array (based on your JwtStrategy)
    const userRoles = Array.isArray(user.role) ? user.role : [user.role];

    // Check if any of the user's roles match the required roles
    // Note: Assuming user.role objects have a 'name' property
    const hasRole = userRoles.some((role) => 
        requiredRoles.includes(role.name) || role.name === RoleEnum.SUPER_ADMIN
    );

    if (!hasRole) {
        throw new ForbiddenException('You do not have the required role');
    }
    
    return true;
}
}
