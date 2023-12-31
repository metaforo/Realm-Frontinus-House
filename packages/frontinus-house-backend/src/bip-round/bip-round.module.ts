import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from '../community/community.entity';
import { CommunitiesService } from '../community/community.service';
import { Proposal } from '../proposal/proposal.entity';
import { ProposalsService } from '../proposal/proposals.service';
import { BipRound } from './bip-round.entity';
import { BipRoundController } from './bip-round.controller';
import { BipRoundService } from './bip-round.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Snapshot } from '../voting-power-snapshot/snapshot.entity';
import { DelegateService } from '../delegate/delegate.service';
import { Delegate } from '../delegate/delegate.entity';
import { DelegationService } from '../delegation/delegation.service';
import { Delegation } from '../delegation/delegation.entity';
import { AdminService } from '../admin/admin.service';
import { Admin } from '../admin/admin.entity';
import { BipOptionService } from 'src/bip-option/bip-option.service';
import { BipOptionModule } from 'src/bip-option/bip-option.module';
import { BipVoteService } from 'src/bip-vote/bip-vote.service';
import { HttpModule } from '@nestjs/axios';
import { AxiosModule } from 'src/http-service/axios.module';
import { AxiosService } from 'src/http-service/axios.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Admin,
      BipRound,
      Proposal,
      Community,
      Snapshot,
      Delegate,
      Delegation,
    ]),
    BipOptionModule,
    HttpModule,
    AxiosModule,
  ],
  controllers: [BipRoundController],
  providers: [
    BipRoundService,
    BipOptionService,
    BipVoteService,
    AdminService,
    BlockchainService,
    DelegateService,
    DelegationService,
    AxiosService,
  ],
  exports: [TypeOrmModule],
})
export class BipRoundModule {}
