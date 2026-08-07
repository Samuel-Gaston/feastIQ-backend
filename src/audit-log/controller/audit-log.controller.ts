import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuditLogService } from "../service/audit-log.service";
import { I18n, I18nContext } from "nestjs-i18n";
import { Roles } from "../../common/decorators/role.decorator";
import { RoleEnum } from "../../common/enums/role.enum";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/role.guard";


@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Audit Logs')
@ApiResponse({status:404, description:'NOT FOUND'})
@ApiResponse({ status: 400, description: "BAD_REQUEST" })
@ApiResponse({ status: 401, description: "UNAUTHORIZED" })
@ApiResponse({ status: 403, description: "FORBIDDEN" })
@ApiResponse({ status: 500, description: "SERVER_ERROR" })
@Controller('admin/audit-logs')
export class AuditLogController{
    constructor(
        private readonly auditLogService: AuditLogService
    ){}

    @Get()
    @Roles(RoleEnum.ADMIN)
    @ApiOperation({summary: 'searchable audit trail of admin actions'})
    @ApiResponse({status: 200, description:'audit logs fetched successfully'})
    async getAll(
        @I18n() i18n: I18nContext
    ){
        const response = await this.auditLogService.getAll()
        const message = i18n.t("common.AUDIT_LOG_READ")
        return {data:response, message}
    }

}