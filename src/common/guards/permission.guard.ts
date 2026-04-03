import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    BadRequestException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  
  @Injectable()
  export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
  
    canActivate(context: ExecutionContext): boolean {
      const requiredPermissions = this.reflector.get<string[]>(
        'permissions',
        context.getHandler(),
      );
  
      if (!requiredPermissions) return true;
  
      // Ensure only ONE permission is applied
      if (requiredPermissions.length !== 1) {
        throw new BadRequestException(
          'Only one permission must be applied to this route',
        );
      }
  
      const request = context.switchToHttp().getRequest();
      const user = request.user;
  
      if (!user) {
        throw new ForbiddenException('User not found');
      }
  
      const requiredPermission = requiredPermissions[0];
  
      const hasPermission = user.permissions?.includes(requiredPermission);
  
      if (!hasPermission) {
        throw new ForbiddenException(
          'You do not have the required permission',
        );
      }
  
      return true;
    }
  }
  