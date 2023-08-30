import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Community } from '../community/community.entity';
import { Proposal } from '../proposal/proposal.entity';
import {
  AfterLoad,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AuctionVisibleStatus } from '@nouns/frontinus-house-wrapper';
import { Exclude } from 'class-transformer';
import { Address } from '../types/address';
import { BipOption } from 'src/bip-option/bip-option.entity';

@Entity()
@ObjectType()
export class BipRound {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  @Field(() => Int, {
    description: 'All auctions are issued a unique ID number',
  })
  id: number;

  @ApiProperty()
  @Column({ default: true })
  visible: boolean;

  @ApiProperty({ description: 'The signer address' })
  @Column({ default: '' })
  @Field(() => String)
  address: Address;

  @ApiProperty()
  @Column()
  @Field(() => String)
  title: string;

  @ApiProperty()
  @Column()
  @Field(() => Date, {
    description: 'After the Start Time users may submit proposals',
  })
  startTime: Date;

  @ApiProperty()
  @Column()
  @Field(() => Date, {
    description: 'Users may submit proposals up until Proposal End Time',
  })
  endTime: Date;

  @OneToMany(() => BipOption, (bipOption) => bipOption.bipRound, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn()
  @Field(() => [BipOption])
  bipOptions: BipOption[];

  @ApiProperty({ isArray: true })
  @RelationId((bipRound: BipRound) => bipRound.bipOptions)
  bipOptionIds: number[];

  @ApiProperty({
    type: Number,
    description: 'The number of proposals related to the auction',
  })
  @Exclude()
  // This attribute was previously defined in the API layer, which is quite strange - -
  numProposals: number;

//   @ApiProperty({ type: Number })
//   @ManyToOne(() => Community, (community) => community.auctions, {
//     createForeignKeyConstraints: false,
//   })
//   @JoinColumn()
//   @Field(() => Community)
//   community: Community;

  @ApiProperty()
  @CreateDateColumn()
  @Field(() => Date)
  createdDate: Date;

  @ApiProperty()
  @UpdateDateColumn({ nullable: true })
  @Field(() => Date)
  lastUpdatedDate: Date;

  @Exclude({ toPlainOnly: true })
  @DeleteDateColumn()
  deletedAt: Date;

  @ApiProperty()
  @Column({ default: 0 })
  @Field(() => String)
  balanceBlockTag: number;

  @ApiProperty()
  @Column({
    type: 'int',
    enum: AuctionVisibleStatus,
    default: AuctionVisibleStatus.NORMAL,
    comment: '0 means pending, 1 means normal',
  })
  visibleStatus: AuctionVisibleStatus;

  public isAcceptingProposals = (): boolean =>
    new Date() > this.startTime &&
    new Date() <= this.endTime &&
    this.visibleStatus == AuctionVisibleStatus.NORMAL;

  // @AfterLoad()
  // public countProposals() {
  //   if (this.bipOptionIds && this.bipOptionIds.length > 0) {
  //     this.numProposals = this.bipOptionIds.length;
  //   } else if (this.bipOptions) {
  //     this.numProposals = this.bipOptions.length;
  //   } else {
  //     this.numProposals = 0;
  //   }
  // }
}

