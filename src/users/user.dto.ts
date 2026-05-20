import {
  IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength,
} from 'class-validator';
import { UserRole } from './user.entity';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  full_name: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  full_name?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
