import classes from './AcceptingPropsModule.module.css';
import { Community, StoredAuctionBase } from '@nouns/frontinus-house-wrapper/dist/builders';
import { AuctionStatus, auctionStatus } from '../../utils/auctionStatus';
import { useDispatch } from 'react-redux';
import { clearProposal } from '../../state/slices/editor';
import Button, { ButtonColor } from '../Button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RoundModuleCard from '../RoundModuleCard';
import { isInfAuction } from '../../utils/auctionType';
import dayjs from 'dayjs';
import ConnectButton from '../ConnectButton';
import { useAccount } from 'wagmi';
import { useAppSelector } from '../../hooks';

const AcceptingPropsModule: React.FC<{
  auction: StoredAuctionBase;
  community: Community;
}> = props => {
  const { auction, community } = props;

  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const isProposingWindow = auctionStatus(auction) === AuctionStatus.AuctionAcceptingProps;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { address: account } = useAccount();
  const { t } = useTranslation();

  const content = (
    <>
      <b>{t('howProposingWorks')}:</b>
      <div className={classes.bulletList}>
        <div className={classes.bulletItem}>
          <hr className={classes.bullet} />
          <div className={classes.customParagraph}>
            <li>
              Anyone can submit aproposal to get funded.
            </li>
            <li>
              Owners of the Frontinus token will vote on the best proposals.
            </li>
            <li>
              The top 1 proposal will get funded 1
            </li>

            <li>
              1 each
            </li>
          </div>
        </div>

        <div className={classes.bulletItem}>
          <hr className={classes.bullet} />
          <p></p>
        </div>

        <div className={classes.bulletItem}>
          <hr className={classes.bullet} />
          <p>{isInfAuction(auction) ? 'Proposals that meet quorum will get funded.' : <></>}</p>
        </div>
      </div>

      {isProposingWindow &&
        (account ? (
          <Button
            text={t('Create your proposal')}
            bgColor={ButtonColor.Green}
            onClick={() => {
              dispatch(clearProposal());
              navigate('/create', { state: { auction, community, proposals } });
            }}
          />
        ) : (
          <ConnectButton color={ButtonColor.Pink} />
        ))}
    </>
  );

  return (
    <RoundModuleCard
      title={t('acceptingProposals')}
      subtitle={
        <>
          Until{' '}
          {isInfAuction(auction)
            ? 'funding is depleted'
            : dayjs(auction.proposalEndTime).format('MMMM D')}
        </>
      }
      content={content}
      type="proposing"
    />
  );
};

export default AcceptingPropsModule;