import {
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
} from '@nestjs/graphql';
import { Auction } from '../auction/auction.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  RelationId,
} from 'typeorm';

@Entity()
@ObjectType()
export class Community {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ default: true })
  visible: boolean;

  @Column()
  @Field(() => String, {
    description: 'The contract address that is queried for balances',
  })
  contractAddress: string;

  @Column()
  @Field(() => String)
  name: string;

  @Column()
  @Field(() => String)
  profileImageUrl: string;

  @Column({ nullable: true })
  @Field(() => String)
  description: string;

  @Field(() => Int)
  numAuctions: number;

  @OneToMany(() => Auction, (auction) => auction.community, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn()
  @Field(() => [Auction])
  auctions: Auction[];

  @Column()
  @Field(() => Date)
  createdDate: Date;

  @Column({ nullable: true })
  @Field(() => Date)
  lastUpdatedDate: Date;

  @BeforeInsert()
  setCreatedDate() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  setUpdatedDate() {
    this.lastUpdatedDate = new Date();
  }
}

@InputType()
export class CommunityInput extends PartialType(Community) {}
