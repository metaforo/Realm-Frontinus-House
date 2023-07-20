import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Query,
  } from '@nestjs/common';
  import { ParseDate } from 'src/utils/date';
  import { Delegate } from './delegate.entity';
  import { CreateDelegateDto, GetDelegateDto, LatestDto } from './delegate.types';
  import { DelegateService} from './delegate.service';
  import { DelegationService} from 'src/delegation/delegation.service';
  import { ProposalsService } from 'src/proposal/proposals.service';
  import { Proposal } from 'src/proposal/proposal.entity';
  import { InfiniteAuctionProposal } from 'src/proposal/infauction-proposal.entity';
  import { AdminService } from 'src/admin/admin.service';
  import { Admin } from 'src/admin/admin.entity';
  
  @Controller('delegates')
  export class DelegateController {
    [x: string]: any;
    constructor(
      private readonly delegateService: DelegateService,
      private readonly delegationService: DelegationService,
      private readonly adminService: AdminService,
    ) {}
  

    @Get('/list')
    async getAll(@Body() dto: GetDelegateDto): Promise<Delegate[]> {

      return this.delegateService.findAll(); 
    }

    @Post('/create')
    async create(@Body() dto: CreateDelegateDto): Promise<Delegate> {
      const delegate = new Delegate();
      delegate.delegationId = dto.delegationId;
      delegate.applicationId = dto.applicationId;
      delegate.fromAddress = dto.fromAddress;
      delegate.toAddress = dto.toAddress;

      return this.delegateService.store(delegate);
    }

  
    @Get(':id')
    async findOne(@Param('id') id: number): Promise<Delegate> {
      const foundDelegate = await this.delegateService.findOne(id);

      if (!foundDelegate)
        throw new HttpException('Delegate not found', HttpStatus.NOT_FOUND);
        
      return foundDelegate;
    }
  
  }
  