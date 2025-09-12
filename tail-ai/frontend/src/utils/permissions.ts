export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN', 
  MEMBER = 'MEMBER'
}

export enum Permission {
  // Team Management
  INVITE_TEAM_MEMBERS = 'invite_team_members',
  REMOVE_TEAM_MEMBERS = 'remove_team_members',
  CHANGE_TEAM_ROLES = 'change_team_roles',
  VIEW_TEAM_MEMBERS = 'view_team_members',
  
  // Project Management
  CREATE_PROJECTS = 'create_projects',
  EDIT_ALL_PROJECTS = 'edit_all_projects',
  DELETE_ALL_PROJECTS = 'delete_all_projects',
  VIEW_ALL_PROJECTS = 'view_all_projects',
  EDIT_ASSIGNED_PROJECTS = 'edit_assigned_projects',
  VIEW_ASSIGNED_PROJECTS = 'view_assigned_projects',
  
  // Task Management
  CREATE_TASKS = 'create_tasks',
  EDIT_ALL_TASKS = 'edit_all_tasks',
  DELETE_ALL_TASKS = 'delete_all_tasks',
  ASSIGN_TASKS = 'assign_tasks',
  VIEW_ALL_TASKS = 'view_all_tasks',
  EDIT_ASSIGNED_TASKS = 'edit_assigned_tasks',
  VIEW_ASSIGNED_TASKS = 'view_assigned_tasks',
  
  // Account & Billing
  MANAGE_BILLING = 'manage_billing',
  MANAGE_ACCOUNT_SETTINGS = 'manage_account_settings',
  
  // Reports & Analytics
  VIEW_ALL_REPORTS = 'view_all_reports',
  VIEW_ASSIGNED_REPORTS = 'view_assigned_reports'
}

// Define role permissions (same as backend)
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.OWNER]: [
    // Full access to everything
    Permission.INVITE_TEAM_MEMBERS,
    Permission.REMOVE_TEAM_MEMBERS,
    Permission.CHANGE_TEAM_ROLES,
    Permission.VIEW_TEAM_MEMBERS,
    Permission.CREATE_PROJECTS,
    Permission.EDIT_ALL_PROJECTS,
    Permission.DELETE_ALL_PROJECTS,
    Permission.VIEW_ALL_PROJECTS,
    Permission.CREATE_TASKS,
    Permission.EDIT_ALL_TASKS,
    Permission.DELETE_ALL_TASKS,
    Permission.ASSIGN_TASKS,
    Permission.VIEW_ALL_TASKS,
    Permission.MANAGE_BILLING,
    Permission.MANAGE_ACCOUNT_SETTINGS,
    Permission.VIEW_ALL_REPORTS
  ],
  
  [UserRole.ADMIN]: [
    // Team management (except OWNER)
    Permission.INVITE_TEAM_MEMBERS,
    Permission.REMOVE_TEAM_MEMBERS,
    Permission.CHANGE_TEAM_ROLES,
    Permission.VIEW_TEAM_MEMBERS,
    // Full project access
    Permission.CREATE_PROJECTS,
    Permission.EDIT_ALL_PROJECTS,
    Permission.DELETE_ALL_PROJECTS,
    Permission.VIEW_ALL_PROJECTS,
    // Full task access
    Permission.CREATE_TASKS,
    Permission.EDIT_ALL_TASKS,
    Permission.DELETE_ALL_TASKS,
    Permission.ASSIGN_TASKS,
    Permission.VIEW_ALL_TASKS,
    // Reports
    Permission.VIEW_ALL_REPORTS
    // Note: No billing or account settings access
  ],
  
  [UserRole.MEMBER]: [
    // Limited project access
    Permission.VIEW_ASSIGNED_PROJECTS,
    Permission.EDIT_ASSIGNED_PROJECTS,
    // Task management (assigned only)
    Permission.VIEW_ASSIGNED_TASKS,
    Permission.EDIT_ASSIGNED_TASKS,
    // Reports (assigned only)
    Permission.VIEW_ASSIGNED_REPORTS
    // Note: No team management, billing, or account settings
  ]
};

export class PermissionChecker {
  /**
   * Check if a user has a specific permission
   */
  static hasPermission(userRole: UserRole, permission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    return rolePermissions.includes(permission);
  }

  /**
   * Check if a user can manage another user
   */
  static canManageUser(managerRole: UserRole, targetRole: UserRole): boolean {
    if (targetRole === UserRole.OWNER) {
      return false; // OWNER cannot be managed by anyone
    }
    
    if (managerRole === UserRole.OWNER) {
      return true; // OWNER can manage everyone
    }
    
    if (managerRole === UserRole.ADMIN && targetRole === UserRole.MEMBER) {
      return true; // ADMIN can manage MEMBER
    }
    
    return false;
  }

  /**
   * Check if a role can be changed to another role
   */
  static canChangeRole(
    currentRole: UserRole,
    newRole: UserRole,
    changerRole: UserRole
  ): boolean {
    // OWNER role cannot be changed
    if (currentRole === UserRole.OWNER) {
      return false;
    }
    
    // Only OWNER can promote to ADMIN
    if (newRole === UserRole.ADMIN && changerRole !== UserRole.OWNER) {
      return false;
    }
    
    // OWNER can change any role (except OWNER)
    if (changerRole === UserRole.OWNER) {
      return true;
    }
    
    // ADMIN can only demote to MEMBER
    if (changerRole === UserRole.ADMIN && newRole === UserRole.MEMBER) {
      return true;
    }
    
    return false;
  }

  /**
   * Get all permissions for a role
   */
  static getRolePermissions(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }
}

// Helper function to get user role from team member data
export function getUserRole(teamMember: any, isAccountOwner: boolean = false): UserRole {
  if (isAccountOwner) {
    return UserRole.OWNER;
  }
  
  if (teamMember?.role) {
    return teamMember.role as UserRole;
  }
  
  return UserRole.MEMBER; // Default to MEMBER
}

// Helper function to get role display name
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case UserRole.OWNER:
      return 'Account Owner';
    case UserRole.ADMIN:
      return 'Team Administrator';
    case UserRole.MEMBER:
      return 'Team Member';
    default:
      return 'Unknown';
  }
}

// Helper function to get role description
export function getRoleDescription(role: UserRole): string {
  switch (role) {
    case UserRole.OWNER:
      return 'Full access to everything. Can manage all team members, projects, and account settings.';
    case UserRole.ADMIN:
      return 'Can manage team members and has full access to all projects and tasks. Cannot access billing or account settings.';
    case UserRole.MEMBER:
      return 'Limited access to assigned projects and tasks only. Cannot invite team members or manage projects.';
    default:
      return 'Unknown role';
  }
}
