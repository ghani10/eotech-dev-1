import { ref, computed } from 'vue'

/**
 * Auth Composable with RBAC Support
 * 
 * Provides:
 * - User authentication state
 * - Role-based access control
 * - Permissions management
 * - Auth utilities
 */

export type AppRole =
  | 'guest'
  | 'participant'
  | 'volunteer_organizer'
  | 'event_organizer_admin'
  | 'super_admin'

interface User {
  user_id: string
  email: string
  fullName: string | null
  role: AppRole
  createdAt: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  token: string | null
}

// Role hierarchy for permission checking
const ROLE_HIERARCHY: Record<AppRole, number> = {
  guest: 0,
  participant: 1,
  volunteer_organizer: 2,
  event_organizer_admin: 3,
  super_admin: 4,
}

// Permissions per role
const ROLE_PERMISSIONS: Record<AppRole, string[]> = {
  guest: ['view_public_events'],
  participant: [
    'view_public_events',
    'view_own_profile',
    'purchase_tickets',
    'view_own_orders',
    'view_own_tickets',
  ],
  volunteer_organizer: [
    'view_events',
    'checkin_tickets',
    'view_event_summary',
    'export_checkin_report',
  ],
  event_organizer_admin: [
    'manage_events',
    'manage_ticket_types',
    'invite_partners',
    'view_reports',
    'manage_event_members',
    'view_participants_list',
  ],
  super_admin: [
    'manage_all_events',
    'manage_all_users',
    'manage_system_settings',
    'view_system_reports',
    'manage_roles',
  ],
}

const authState = ref<AuthState>({
  user: null,
  isAuthenticated: false,
  token: null,
})

/**
 * Initialize auth state from localStorage
 */
const initAuth = () => {
  const stored = localStorage.getItem('auth_state')
  if (stored) {
    const parsed = JSON.parse(stored)
    authState.value = parsed
  }
}

/**
 * Login user
 */
const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      return false
    }

    // Fetch user data after login
    const userResponse = await fetch('/api/user')
    const userData = await userResponse.json()

    authState.value = {
      user: userData,
      isAuthenticated: true,
      token: localStorage.getItem('auth_token'),
    }

    localStorage.setItem('auth_state', JSON.stringify(authState.value))
    return true
  } catch (error) {
    console.error('Login error:', error)
    return false
  }
}

/**
 * Logout user
 */
const logout = async (): Promise<void> => {
  try {
    await fetch('/logout', { method: 'POST' })
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    authState.value = {
      user: null,
      isAuthenticated: false,
      token: null,
    }
    localStorage.removeItem('auth_state')
  }
}

/**
 * Check if user has specific role
 */
const hasRole = (roles: AppRole | AppRole[]): boolean => {
  if (!authState.value.user) return false

  const targetRoles = Array.isArray(roles) ? roles : [roles]
  return targetRoles.includes(authState.value.user.role)
}

/**
 * Check if user has minimum role level
 */
const hasMinRole = (minRole: AppRole): boolean => {
  if (!authState.value.user) return false

  const userLevel = ROLE_HIERARCHY[authState.value.user.role]
  const minLevel = ROLE_HIERARCHY[minRole]

  return userLevel >= minLevel
}

/**
 * Check if user has specific permission
 */
const getEffectivePermissions = (role: AppRole): string[] => {
  const maxLevel = ROLE_HIERARCHY[role]

  const permissions = Object.entries(ROLE_HIERARCHY)
    .filter(([, level]) => level <= maxLevel)
    .flatMap(([roleName]) => ROLE_PERMISSIONS[roleName as AppRole])

  return Array.from(new Set(permissions))
}

const hasPermission = (permission: string | string[]): boolean => {
  if (!authState.value.user) return false

  const permissions = Array.isArray(permission) ? permission : [permission]
  const userPermissions = getEffectivePermissions(authState.value.user.role)

  return permissions.every((perm) => userPermissions.includes(perm))
}

/**
 * Check if user owns resource
 */
const isResourceOwner = (ownerId: string): boolean => {
  return authState.value.user?.user_id === ownerId
}

/**
 * Get user role
 */
const getUserRole = (): AppRole | null => {
  return authState.value.user?.role || null
}

/**
 * Get user display name
 */
const getUserDisplayName = (): string => {
  if (!authState.value.user) return 'Guest'
  return authState.value.user.fullName || authState.value.user.email.split('@')[0]
}

/**
 * Get user initials
 */
const getUserInitials = (): string => {
  if (!authState.value.user) return 'G'

  const name = authState.value.user.fullName || authState.value.user.email
  const parts = name.split(' ')
  
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return name.substring(0, 2).toUpperCase()
}

/**
 * Computed properties
 */
const user = computed(() => authState.value.user)
const isAuthenticated = computed(() => authState.value.isAuthenticated)
const userRole = computed(() => authState.value.user?.role)
const isSuperAdmin = computed(() => authState.value.user?.role === 'super_admin')
const isEventOrganizer = computed(() => authState.value.user?.role === 'event_organizer_admin')
const isVolunteer = computed(() => authState.value.user?.role === 'volunteer_organizer')
const isParticipant = computed(() => authState.value.user?.role === 'participant')

export const useAuth = () => ({
  // State
  authState,
  user,
  isAuthenticated,
  userRole,
  isSuperAdmin,
  isEventOrganizer,
  isVolunteer,
  isParticipant,

  // Methods
  initAuth,
  login,
  logout,
  hasRole,
  hasMinRole,
  hasPermission,
  isResourceOwner,
  getUserRole,
  getUserDisplayName,
  getUserInitials,
})
