import {
  AccessCategoryInfo,
  AccessPolicyResponse,
  AccessRoleInfo,
  DocumentCategory,
  UserRole,
} from "@/types";

export const DEFAULT_USER_ROLE: UserRole = "employee";

export const ROLE_LABELS: Record<UserRole, string> = {
  employee: "Collaborateur",
  engineer: "Ingénieur logiciel",
  manager: "Manager",
  rh: "Ressources humaines",
  admin: "Administrateur",
};

export const REGISTERABLE_ROLES: UserRole[] = [
  "employee",
  "engineer",
  "manager",
  "rh",
];

export const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  public: "Public",
  engineering: "Technique",
  rh: "RH",
  gouvernance: "Gouvernance",
  finance: "Finance",
};

export function categoryBadgeClass(category: string): string {
  return `category-pill category-${category}`;
}

export function buildAccessMatrix(
  policy: AccessPolicyResponse
): { roles: AccessRoleInfo[]; categories: AccessCategoryInfo[] } {
  return {
    roles: policy.roles,
    categories: policy.categories,
  };
}

export function roleHasCategory(
  role: AccessRoleInfo,
  categoryId: DocumentCategory
): boolean {
  return role.categories.includes(categoryId);
}
