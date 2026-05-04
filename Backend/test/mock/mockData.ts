import { JwtPayload } from 'jsonwebtoken';
import { ProjectServices } from '../../src/services/projects.service';
import { userServices } from '../../src/services/users.service';

// --- Project Mocks ---
export const mockProjectResponse = {
  _id: '65f1a2b3c4d5e6f7a8b9c0d2',
  projectName: 'Test Project',
  projectDescription: 'Integration testing with Vitest',
  owner: '65f1a2b3c4d5e6f7a8b9c0d1',
} as unknown as Awaited<ReturnType<typeof ProjectServices.createNewProject>>;

export const mockUpdatedProject = {
  _id: '65f1a2b3c4d5e6f7a8b9c0d2',
  projectName: 'Updated Project',
  projectDescription: 'Updated desc',
} as unknown as Awaited<ReturnType<typeof ProjectServices.updateProject>>;

export const mockProjectList = [
  { _id: '1', projectName: 'P1' },
  { _id: '2', projectName: 'P2' },
] as unknown as Awaited<ReturnType<typeof ProjectServices.listAllProjects>>;

export const mockProjectWithStats = {
  _id: '65f1a2b3c4d5e6f7a8b9c0d2',
  projectName: 'Test Project',
  fileCount: 5,
  jobCount: 10,
} as unknown as Awaited<ReturnType<typeof ProjectServices.getProjectWithStats>>;

// --- User Mocks ---
export const mockAuthUser = {
  _id: '65f1a2b3c4d5e6f7a8b9c0d1',
  email: 'test@example.com',
} as unknown as Awaited<ReturnType<typeof userServices.checkEmail>>;

// --- User existing  ---
export const mockAuthUserExiest = {
  _id: '65f1a2b3c4d5e6f7a8b9c0d1',
  userEmail: 'existing@gmail.com',
} as unknown as Awaited<ReturnType<typeof userServices.checkEmail>>;

// --- Auth Mocks ---
export const mockJwtSecret = 'test-secret-key';
export const mockJwtToken = 'header.payload.signature';
export const mockDecodedUser: JwtPayload = {
  userEmail: 'test@example.com',
  iat: 123456789,
  exp: 123456789 + 60 * 60 * 12,
};
