import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateAuctionDto {
  @IsString()
  @IsOptional()
  startTime: Date;

  @IsString()
  proposalEndTime: Date;

  @IsString()
  votingEndTime: Date;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsPositive()
  fundingAmount: number;

  @IsNumber()
  @IsPositive()
  numWinners: number;

  @IsString()
  currencyType: string;

  @IsNumber()
  @IsPositive()
  communityId: number;
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetAuctionsDto {
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
  auctionId: number;
}
