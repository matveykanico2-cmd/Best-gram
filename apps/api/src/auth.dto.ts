import { IsEmail, IsOptional, IsString, Length, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString() @Matches(/^[a-zA-Z0-9_]{3,64}$/) username!: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @Length(2, 160) displayName?: string;
  @IsOptional() @IsString() @Length(2, 160) fullName?: string;
  @IsString() @MinLength(8) password!: string;
}
export class LoginDto {
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @Length(3, 64) username?: string;
  @IsString() @MinLength(8) password!: string;
}
