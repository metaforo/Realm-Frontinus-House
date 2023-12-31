import classes from './VotesVerificationModal.module.css';
import { SignatureState, StoredProposalWithVotes } from '@nouns/frontinus-house-wrapper/dist/builders';
import EthAddress from '../EthAddress';
import { Dispatch, SetStateAction } from 'react';
import { MdOutlinePendingActions } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal';

const VotesVerificationModal: React.FC<{
  setDisplayVotesVerifModal: Dispatch<SetStateAction<boolean>>;
  proposal: StoredProposalWithVotes;
}> = props => {
  const { proposal, setDisplayVotesVerifModal } = props;
  const { t } = useTranslation();

  const verifiedVotes = (
    <div className={classes.votesContainer}>
      {proposal.votes
        .map((vote, index) => (
          <div key={index} className={classes.votesRow}>
            <div className={classes.voteRowTitle}>
              {`${vote.weight}  ${vote.weight === 1 ? t('vote') : t('votes')} ${t('by')}`}
              <EthAddress address={vote.address} />
            </div>
          </div>
        ))}
    </div>
  );

  return (
    <div onClick={e => e.stopPropagation()}>
      <Modal
        title={proposal.title}
        subtitle={`${proposal.voteCount} ${proposal.voteCount === 1 ? t('vote') : t('votes')} ${t(
          'haveBeenCast',
        )}`}
        body={verifiedVotes}
        setShowModal={setDisplayVotesVerifModal}
      />
    </div>
  );
};

export default VotesVerificationModal;
