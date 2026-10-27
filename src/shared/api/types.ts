/**
 * Единый источник типов — модели, сгенерированные из OpenAPI-контракта бекенда
 * (orval, `pnpm gen:api`). Легаси-имена (User, AuthTokens, ...) сохранены как
 * алиасы, чтобы существующий код не ломался. Новый код импортирует типы и хуки
 * напрямую из `./generated`.
 */
export type {
  UserResponseDto as User,
  UserResponseDtoRole as UserRole,
  TokensDto as AuthTokens,
  LoginDto as LoginRequest,
  AuthResponseDto as LoginResponse,
} from './generated/model';

// У бекенда для verify-email нет типизированного DTO в контракте — остаётся локально
export interface VerifyEmailRequest {
  token: string;
}
