import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from 'src/community/community.entity';
import { CommunitiesService } from 'src/community/community.service';
import { InfiniteAuction } from 'src/infinite-auction/infinite-auction.entity';
import { InfiniteAuctionService } from 'src/infinite-auction/infinite-auction.service';
import { Proposal } from 'src/proposal/proposal.entity';
import { ProposalsService } from 'src/proposal/proposals.service';
import { Delegate } from './delegate.entity';
import { Auction } from 'src/auction/auction.entity';
// import { AuctionsResolver } from './auction.resolver';
import { DelegatesController } from './delegates.controller';
import { DelegatesService } from './delegates.service';
import { AdminService } from 'src/admin/admin.service';
import { Admin } from 'src/admin/admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Delegate, Proposal, Community, InfiniteAuction, Auction, Admin]),
  ],
  controllers: [DelegatesController],
  providers: [
    DelegatesService,
    ProposalsService,
    AdminService,
    // DelegatesResolver,
    CommunitiesService,
    InfiniteAuctionService,
  ],
  exports: [TypeOrmModule],
})
export class DelegatesModule {}
