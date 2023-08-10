import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Application } from './application.entity';
import { CreateApplicationDto, GetApplicationDto } from './application.types';
import { ApplicationService } from './application.service';
import { ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { ECDSASignedPayloadValidationPipe } from '../entities/ecdsa-signed.pipe';
import { verifySignPayload } from '../utils/verifySignedPayload';
import { BlockchainService } from '../blockchain/blockchain.service';
import { DelegationService } from '../delegation/delegation.service';
import { DelegateService } from '../delegate/delegate.service';
import { Community } from '../community/community.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('applications')
export class ApplicationController {
  [x: string]: any;

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly delegationService: DelegationService,
    private readonly delegateService: DelegateService,
    private readonly blockchainService: BlockchainService,
    @InjectRepository(Community)
    private communitiesRepository: Repository<Community>,
  ) {}

  @Get('/list')
  @ApiOkResponse({
    type: [Application],
  })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getAll(): Promise<Application[]> {
    return this.applicationService.findAll();
  }

  @Get('/byDelegation/:delegationId')
  @ApiOkResponse({
    type: [Application],
  })
  async findByDelegation(
    @Param('delegationId') delegationId: number,
    @Body() dto: GetApplicationDto,
  ): Promise<Application[]> {
    const applications = await this.applicationService.findByDelegation(
      delegationId,
      dto,
    );
    if (!applications)
      throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
    return applications;
  }

  @Get('/checkApplied')
  @ApiOkResponse({
    type: Boolean,
  })
  async findApplied(
    @Query('delegationId') delegationId: number,
    @Query('address') address: string,
  ): Promise<boolean> {
    const application = await this.applicationService.findByAddress(
      delegationId,
      address,
    );

    if (!application) return false;

    return true;
  }

  @Post('/create')
  @ApiOkResponse({
    type: Application,
  })
  async create(
    @Body(ECDSASignedPayloadValidationPipe) dto: CreateApplicationDto,
  ): Promise<Application> {
    verifySignPayload(dto, ['delegationId', 'title']);

    // Delegation must exists:
    const delegation = await this.delegationService.findOne(dto.delegationId);

    if (!delegation) {
      throw new HttpException(
        'Delegation not found. Cannot create application',
        HttpStatus.BAD_REQUEST,
      );
    }

    const currentDate = new Date();
    if (
      currentDate < delegation.startTime ||
      currentDate > delegation.proposalEndTime
    ) {
      throw new HttpException(
        'Not in the eligible create application period.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Same Application must NOT exists:
    const existingApplication = await this.applicationService.findBy({
      where: { delegationId: dto.delegationId, address: dto.address },
    });

    if (existingApplication) {
      throw new HttpException(
        'Application already exists!',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Can not create application if he already delegate to another user.
    const existingDelegate = await this.delegateService.findOneBy({
      where: { delegationId: dto.delegationId, fromAddress: dto.address },
    });
    if (existingDelegate) {
      throw new HttpException(
        'Already delegate to another',
        HttpStatus.BAD_REQUEST,
      );
    }

    // TODO: add communityId in delegation, remove get community by id=1
    const community = await this.communitiesRepository.findOne(1);

    // Check voting power
    const vp = await this.blockchainService.getVotingPowerWithSnapshot(
      dto.address,
      community.contractAddress,
    );
    if (vp <= 0) {
      throw new HttpException('No voting power', HttpStatus.BAD_REQUEST);
    }

    // Create:
    const newApplication = this.applicationRepository.create({
      ...dto,
      delegation,
    });
    return await this.applicationRepository.save(newApplication);
  }

  @Get('/:id/detail')
  @ApiOkResponse({
    type: Application,
  })
  async findOne(@Param('id') id: number): Promise<Application> {
    const foundApplication = await this.applicationService.findOne(id);

    if (!foundApplication)
      throw new HttpException('Application not found', HttpStatus.NOT_FOUND);

    return foundApplication;
  }
}
