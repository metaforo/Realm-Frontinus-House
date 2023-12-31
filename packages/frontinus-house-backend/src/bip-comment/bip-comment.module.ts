import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from '../community/community.entity';
import { CommunitiesService } from '../community/community.service';
import { Proposal } from '../proposal/proposal.entity';
import { ProposalsService } from '../proposal/proposals.service';
import { Auction } from '../auction/auction.entity';
import { Delegation } from '../delegation/delegation.entity';
import { ApplicationService } from '../delegation-application/application.service';
import { Application } from '../delegation-application/application.entity';
import { Delegate } from '../delegate/delegate.entity';
import { BipComment } from './bip-comment.entity';
import { BipCommentsController } from './bip-comment.controller';
import { BipOption } from 'src/bip-option/bip-option.entity';
import { BipRound } from 'src/bip-round/bip-round.entity';
import { BipCommentsService } from './bip-comment.service';
import { BipRoundService } from 'src/bip-round/bip-round.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { SnapshotModule } from 'src/voting-power-snapshot/snapshot.module';
import { BipOptionService } from 'src/bip-option/bip-option.service';
import { HttpModule } from '@nestjs/axios';
import { AxiosModule } from 'src/http-service/axios.module';
import { AxiosService } from 'src/http-service/axios.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BipComment,
      BipOption,
      BipRound,
      Delegation,
      Delegate,
      Application,
    ]),
    SnapshotModule,
    HttpModule,
    AxiosModule,
  ],
  controllers: [BipCommentsController],
  providers: [
    BipCommentsService,
    BipRoundService,
    BipOptionService,
    BlockchainService,
    ApplicationService,
    AxiosService,
  ],
  exports: [TypeOrmModule],
})
export class BipCommentsModule {}
