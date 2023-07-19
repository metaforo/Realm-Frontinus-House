import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateDelegateDto {
  @IsString()
  @IsOptional()
  startTime: Date;

  @IsString()
  proposalEndTime: Date;

  @IsString()
  votingEndTime: Date;

  @IsString()
  endTime: Date;

  @IsString()
  title: string;

  @IsString()
  description: string;

//   @IsNumber()
//   @IsPositive()
//   communityId: number;
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetDelegatesDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => Number(value))
  skip?: number;

  @IsOptional()
  @Transform(({ value }) => value?.toUpperCase())
  @IsEnum(Order)
  order?: Order;

  @IsOptional()
  @IsArray()
  addresses?: string[];
}

export class LatestDto {
  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  timestamp: number;

  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  delegateId: number;
}