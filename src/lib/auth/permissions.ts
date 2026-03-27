import { createAccessControl } from "better-auth/plugins/access"
import {
  defaultStatements,
  userAc,
  adminAc,
} from "better-auth/plugins/admin/access"

export const ac = createAccessControl(defaultStatements)

export const user = ac.newRole(userAc.statements)

export const admin = ac.newRole(adminAc.statements)