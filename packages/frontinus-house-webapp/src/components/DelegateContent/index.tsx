import {
  SignatureState,
  StoredProposalWithVotes,
  Vote,
  StoredAuctionBase,
} from '@nouns/frontinus-house-wrapper/dist/builders';
import classes from './DelegateContent.module.css';
import { auctionStatus, AuctionStatus } from '../../utils/auctionStatus';
import { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../hooks';
import { ApiWrapper } from '@nouns/frontinus-house-wrapper';
import { refreshActiveProposals } from '../../utils/refreshActiveProposal';

import ErrorMessageCard from '../ErrorMessageCard';
import VoteConfirmationModal from '../VoteConfirmationModal';
import SuccessVotingModal from '../SuccessVotingModal';
import ErrorVotingModal from '../ErrorVotingModal';
import {
  clearVoteAllotments,
  setVotesByUserInActiveRound,
  setVotingPower,
} from '../../state/slices/voting';
import { Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import DelegateModules from '../DelegateModules';
import { InfuraProvider } from '@ethersproject/providers';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { fetchBlockNumber } from '@wagmi/core';
import NomineesCard from '../NomineesCard';
import { cardStatus } from '../../utils/cardStatus';
import isWinner from '../../utils/isWinner';
import getWinningIds from '../../utils/getWinningIds';
import { InfRoundFilterType } from '../../state/slices/delegate';
import { isInfAuction, isTimedAuction } from '../../utils/auctionType';

const DelegateContent: React.FC<{
  auction: StoredAuctionBase;
  proposals: StoredProposalWithVotes[];
}> = props => {
  const { auction, proposals } = props;
  const { address: account } = useAccount();

  const [showVoteConfirmationModal, setShowVoteConfirmationModal] = useState(false);
  const [showSuccessVotingModal, setShowSuccessVotingModal] = useState(false);
  const [signerIsContract, setSignerIsContract] = useState(false);
  const [numPropsVotedFor, setNumPropsVotedFor] = useState(0);
  const [showErrorVotingModal, setShowErrorVotingModal] = useState(false);

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const community = useAppSelector(state => state.delegate.activeCommunity);
  const votingPower = useAppSelector(state => state.voting.votingPower);
  const infRoundFilter = useAppSelector(state => state.delegate.infRoundFilterType);

  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);
  const modalActive = useAppSelector(state => state.delegate.modalActive);
  const host = useAppSelector(state => state.configuration.backendHost);

  const client = useRef(new ApiWrapper(host));
  // const { data: signer } = useSigner();
  // const provider = useProvider();

  const provider = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const staleProp = isInfAuction(auction) && infRoundFilter === InfRoundFilterType.Stale;
  const warningMessage = isTimedAuction(auction)
    ? t('submittedApplications')
    : infRoundFilter === InfRoundFilterType.Active
    ? 'Active proposals will show up here.'
    : infRoundFilter === InfRoundFilterType.Winners
    ? 'Proposals that meet quorum will show up here.'
    : 'Proposals that did not meet quorum before voting period ended will show up here.';

  useEffect(() => {
    client.current = new ApiWrapper(host, walletClient);
  }, [walletClient, host]);

  // update submitted votes on proposal changes
  useEffect(() => {
    const votes = proposals.flatMap(p => (p.votes ? p.votes : []));
    if (proposals && account && votes.length > 0)
      dispatch(setVotesByUserInActiveRound(votes.filter(v => v.address === account)));
  }, [proposals, account, dispatch]);

  const _signerIsContract = async () => {
    if (!provider || !account) {
      return false;
    }
    const code = await provider?.getCode(account);
    const isContract = code !== '0x';
    setSignerIsContract(isContract);
    return isContract;
  };

  const handleSubmitVote = async () => {
    try {
      const blockHeight = await fetchBlockNumber();

      const votes = voteAllotments
        .map(
          a =>
            new Vote(
              1,
              a.proposalId,
            ),
        );
      const isContract = await _signerIsContract();

      await client.current.logVotes(votes, isContract);

      setShowErrorVotingModal(false);
      setNumPropsVotedFor(voteAllotments.length);
      setShowSuccessVotingModal(true);
      refreshActiveProposals(client.current, auction, dispatch);
      dispatch(clearVoteAllotments());
      setShowVoteConfirmationModal(false);
    } catch (e) {
      setShowErrorVotingModal(true);
    }
  };

  return (
    <>
      {showVoteConfirmationModal && (
        <VoteConfirmationModal
          setShowVoteConfirmationModal={setShowVoteConfirmationModal}
          submitVote={handleSubmitVote}
        />
      )}

      {showSuccessVotingModal && (
        <SuccessVotingModal
          setShowSuccessVotingModal={setShowSuccessVotingModal}
          numPropsVotedFor={numPropsVotedFor}
          signerIsContract={signerIsContract}
        />
      )}

      {showErrorVotingModal && (
        <ErrorVotingModal setShowErrorVotingModal={setShowErrorVotingModal} />
      )}

      {auctionStatus(auction) === AuctionStatus.AuctionNotStarted ? (
        <ErrorMessageCard message={t('DelegationRoundStartingSoon')} />
      ) : (
        <>
          {community && !modalActive && (
            <Row className={classes.propCardsRow}>
              <Col xl={8} className={classes.propCardsCol}>
                {proposals &&
                  (proposals.length === 0 ? (
                    <ErrorMessageCard message={warningMessage} />
                  ) : (
                    <>
                      {proposals.map((prop, index) => (
                        <Col key={index}>
                          <NomineesCard
                            proposal={prop}
                            auctionStatus={auctionStatus(auction)}
                            cardStatus={cardStatus(votingPower > 0, auction)}
                            isWinner={isWinner(getWinningIds(proposals, auction), prop.id)}
                            stale={staleProp}
                          />
                        </Col>
                      ))}
                    </>
                  ))}
              </Col>

              <DelegateModules
                auction={auction}
                proposals={proposals}
                community={community}
                setShowVotingModal={setShowVoteConfirmationModal}
              />

            </Row>
          )}
        </>
      )}
    </>
  );
};

export default DelegateContent;
