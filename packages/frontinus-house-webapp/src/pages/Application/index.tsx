import classes from './Application.module.css';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import NotFound from '../../components/NotFound';
import React, { useEffect, useRef, useState } from 'react';
import { ApiWrapper } from '@nouns/frontinus-house-wrapper';
import { useDispatch } from 'react-redux';
import { setActiveCommunity, setActiveProposal, setActiveRound } from '../../state/slices/delegate';
import { IoArrowBackCircleOutline } from 'react-icons/io5';
import LoadingIndicator from '../../components/LoadingIndicator';
import { Container } from 'react-bootstrap';
import { buildRoundPath } from '../../utils/buildRoundPath';
import { cardServiceUrl, CardType } from '../../utils/cardServiceUrl';
import OpenGraphElements from '../../components/OpenGraphElements';
import RenderedProposalFields from '../../components/RenderedProposalFields';
import Comments from '../../components/Comments';
import Button, {ButtonColor} from "../../components/Button";
import { setAlert } from '../../state/slices/alert';
import { useWalletClient } from 'wagmi';
import AddressAvatar from "../../components/AddressAvatar";
import {DeleteApplication} from "@nouns/frontinus-house-wrapper/dist/builders";

const Application = () => {
  const params = useParams();
  const { id } = params;

  const { data: walletClient } = useWalletClient();
  const navigate = useNavigate();

  const [failedFetch, setFailedFetch] = useState(false);

  const dispatch = useDispatch();
  const proposal = useAppSelector(state => state.delegate.activeProposal);
  const community = useAppSelector(state => state.delegate.activeCommunity);
  const round = useAppSelector(state => state.delegate.activeRound);
  const backendHost = useAppSelector(state => state.configuration.backendHost);
  const backendClient = useRef(new ApiWrapper(backendHost, walletClient));
  const [loading,setLoading] = useState(true);
  const [canVote, setCanVote] = useState(0); // 200 can vote  311 can cancel
  const [voteCount, setVoteCount] = useState(0);
  const [voteList, setvoteList] = useState([]);

  const handleBackClick = () => {
    if (!proposal || !proposal.delegationId ) return;
    // navigate(buildRoundPath(community, round)+`/${round.id}`, { replace: false });
    navigate(`/delegateDetails/` + proposal.delegationId , { replace: false });
  };

  useEffect(() => {
    backendClient.current = new ApiWrapper(backendHost, walletClient);
  }, [walletClient, backendHost]);

  // fetch proposal
  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      try {
        const proposal = (await backendClient.current.getApplication(
          Number(id),
        ));
        document.title = `${proposal.title}`;
        dispatch(setActiveProposal(proposal));
        setLoading(false);
      } catch (e) {
        setLoading(false);
        setFailedFetch(true);
      }
    };

    fetch();

    return () => {
      document.title = 'Frontinus House';
    };
  }, [id, dispatch, failedFetch]);

  /**
   * when page is entry point, community and round are not yet
   * avail for back button so it has to be fetched.
   */
  useEffect(() => {
    if (!proposal) return;
    const fetchCommunity = async () => {
      const round = await backendClient.current.getDelegateDetails(proposal.delegationId);
      const community = await backendClient.current.getCommunityWithId(round.community);
      dispatch(setActiveCommunity(community));
      dispatch(setActiveRound(round));
    };

    fetchCommunity();
  }, [id, dispatch, proposal]);

  useEffect(() => {
    if (!proposal || !walletClient) return;
    const fetchVoteStatus = async () => {

      const status = await backendClient.current.getDelegateStatus(proposal.id);

      console.log('fetchVoteStatus',status)

      setCanVote(0);
      if(typeof status === 'object'){
        setCanVote(status.data.voteState.code);
      }

    };

    fetchVoteStatus();
  }, [id, dispatch, proposal, walletClient]);

  const fetchVotes = async () => {

    const raw = await backendClient.current.getDelegatesVotes(proposal.id);
    console.log('list',raw);

    setVoteCount(raw.total);

    setvoteList(raw.delegates);
  };

  useEffect(() => {
    if (!proposal) return;
    fetchVotes();
  }, [id, dispatch, proposal]);

  return (
    <>
      <Container>
        {proposal && (
          <OpenGraphElements
            title={proposal.title}
            description={proposal.description}
            imageUrl={cardServiceUrl(CardType.proposal, proposal.id).href}
          />
        )}
        {proposal && !loading ? (
          <Container>
            <RenderedProposalFields
              proposal={proposal}
              community={community}
              round={round && round}
              backButton={
                <div className={classes.backToAuction} onClick={() => handleBackClick()}>
                  <IoArrowBackCircleOutline size={'1.5rem'} /> View delegate
                </div>
              }
            />
          </Container>
        ) : failedFetch ? (
          <NotFound />
        ) : (
          <LoadingIndicator />
        )}

        {proposal && (
            <div style={{ marginTop: '30px', marginBottom: '30px' ,display:'flex'}}>

              {
                 canVote === 200 &&
                 <button
                     className={classes.approveButton}

                     onClick={async () => {
                       try {
                         const voteResult = await backendClient.current.createDelegate(proposal.id);

                         if(voteResult.hasOwnProperty('delegationId') && voteResult.delegationId > 0){
                           dispatch(setAlert({ type: 'success', message: 'success' }));
                           window.setTimeout(function(){
                             window.location.reload();
                           },1000);
                         }

                       } catch (e) {
                         dispatch(setAlert({ type: 'error', message: e }));
                       } finally {

                       }
                     }} >
                   Delegate
                   <svg className={classes.approveSvg} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <g>
                       <path d="M8 1.6C8.55379 1.6 9.09514 1.76422 9.5556 2.07189C10.0161 2.37955 10.3749 2.81685 10.5869 3.32849C10.7988 3.84012 10.8542 4.40311 10.7462 4.94625C10.6382 5.4894 10.3715 5.98831 9.9799 6.3799C9.58831 6.77149 9.0894 7.03816 8.54625 7.1462C8.00311 7.25424 7.44012 7.19879 6.92849 6.98686C6.41685 6.77494 5.97955 6.41605 5.67188 5.9556C5.36422 5.49514 5.2 4.95379 5.2 4.4C5.2 3.65739 5.495 2.9452 6.0201 2.4201C6.5452 1.895 7.25739 1.6 8 1.6ZM8 0C7.12976 0 6.27907 0.258055 5.55549 0.741534C4.83191 1.22501 4.26796 1.9122 3.93493 2.71619C3.6019 3.52019 3.51477 4.40488 3.68454 5.2584C3.85432 6.11191 4.27338 6.89592 4.88873 7.51127C5.50408 8.12662 6.28809 8.54568 7.1416 8.71546C7.99512 8.88523 8.87981 8.79809 9.68381 8.46507C10.4878 8.13204 11.175 7.56809 11.6585 6.84451C12.1419 6.12093 12.4 5.27024 12.4 4.4C12.4 3.82218 12.2862 3.25003 12.0651 2.71619C11.8439 2.18236 11.5198 1.69731 11.1113 1.28873C10.7027 0.880152 10.2176 0.556051 9.68381 0.33493C9.14997 0.113809 8.57782 0 8 0Z" fill="#111111"/>
                       <path d="M2.4 16H0.8C0.587827 16 0.384344 15.9157 0.234315 15.7657C0.0842855 15.6157 0 15.4122 0 15.2V13.6C0 13.3878 0.0842855 13.1843 0.234315 13.0343C0.384344 12.8843 0.587827 12.8 0.8 12.8H2.4C2.61217 12.8 2.81566 12.8843 2.96569 13.0343C3.11571 13.1843 3.2 13.3878 3.2 13.6V15.2C3.2 15.4122 3.11571 15.6157 2.96569 15.7657C2.81566 15.9157 2.61217 16 2.4 16Z" fill="#111111"/>
                       <path d="M15.2 16H13.6C13.3878 16 13.1843 15.9157 13.0343 15.7657C12.8843 15.6157 12.8 15.4122 12.8 15.2V13.6C12.8 13.3878 12.8843 13.1843 13.0343 13.0343C13.1843 12.8843 13.3878 12.8 13.6 12.8H15.2C15.4122 12.8 15.6157 12.8843 15.7657 13.0343C15.9157 13.1843 16 13.3878 16 13.6V15.2C16 15.4122 15.9157 15.6157 15.7657 15.7657C15.6157 15.9157 15.4122 16 15.2 16Z" fill="#111111"/>
                       <path d="M8.8 15.2H7.2C6.98783 15.2 6.78434 15.1157 6.63431 14.9657C6.48429 14.8157 6.4 14.6122 6.4 14.4V12.8C6.4 12.5878 6.48429 12.3843 6.63431 12.2343C6.78434 12.0843 6.98783 12 7.2 12H8.8C9.01217 12 9.21566 12.0843 9.36569 12.2343C9.51571 12.3843 9.6 12.5878 9.6 12.8V14.4C9.6 14.6122 9.51571 14.8157 9.36569 14.9657C9.21566 15.1157 9.01217 15.2 8.8 15.2Z" fill="#111111"/>
                       <path d="M8 9.5344C9.43634 9.5364 10.8187 10.082 11.8693 11.0614C12.9198 12.0409 13.5607 13.3817 13.6632 14.8144H15.2632C15.1637 12.9553 14.3551 11.2051 13.0039 9.92433C11.6527 8.64353 9.86177 7.92962 8 7.92962C6.13823 7.92962 4.34734 8.64353 2.99615 9.92433C1.64495 11.2051 0.836324 12.9553 0.7368 14.8144H2.3368C2.43926 13.3817 3.08018 12.0409 4.13074 11.0614C5.18131 10.082 6.56366 9.5364 8 9.5344Z" fill="#111111"/>
                       <path d="M7.2 8H8.8V12.8H7.2V8Z" fill="#111111"/>
                     </g>
                   </svg>
                 </button>
              }

              {
                canVote === 311 &&
                <button
                    className={classes.disApproveButton}
                    onClick={async () => {
                      try {
                        const result = await backendClient.current.deleteDelegate(new DeleteApplication(proposal.id));

                        dispatch(setAlert({ type: 'success', message: 'success' }));

                        window.setTimeout(function(){
                          window.location.reload();
                        },1000);

                      } catch (e) {
                        dispatch(setAlert({ type: 'error', message: e }));
                      } finally {

                      }
                    }} >
                  Cancel Delegate
                  <svg className={classes.approveSvg} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g>
                      <path d="M8 1.6C8.55379 1.6 9.09514 1.76422 9.5556 2.07189C10.0161 2.37955 10.3749 2.81685 10.5869 3.32849C10.7988 3.84012 10.8542 4.40311 10.7462 4.94625C10.6382 5.4894 10.3715 5.98831 9.9799 6.3799C9.58831 6.77149 9.0894 7.03816 8.54625 7.1462C8.00311 7.25424 7.44012 7.19879 6.92849 6.98686C6.41685 6.77494 5.97955 6.41605 5.67188 5.9556C5.36422 5.49514 5.2 4.95379 5.2 4.4C5.2 3.65739 5.495 2.9452 6.0201 2.4201C6.5452 1.895 7.25739 1.6 8 1.6ZM8 0C7.12976 0 6.27907 0.258055 5.55549 0.741534C4.83191 1.22501 4.26796 1.9122 3.93493 2.71619C3.6019 3.52019 3.51477 4.40488 3.68454 5.2584C3.85432 6.11191 4.27338 6.89592 4.88873 7.51127C5.50408 8.12662 6.28809 8.54568 7.1416 8.71546C7.99512 8.88523 8.87981 8.79809 9.68381 8.46507C10.4878 8.13204 11.175 7.56809 11.6585 6.84451C12.1419 6.12093 12.4 5.27024 12.4 4.4C12.4 3.82218 12.2862 3.25003 12.0651 2.71619C11.8439 2.18236 11.5198 1.69731 11.1113 1.28873C10.7027 0.880152 10.2176 0.556051 9.68381 0.33493C9.14997 0.113809 8.57782 0 8 0Z" fill="#F5EEE6"/>
                      <path d="M2.4 16H0.8C0.587827 16 0.384344 15.9157 0.234315 15.7657C0.0842855 15.6157 0 15.4122 0 15.2V13.6C0 13.3878 0.0842855 13.1843 0.234315 13.0343C0.384344 12.8843 0.587827 12.8 0.8 12.8H2.4C2.61217 12.8 2.81566 12.8843 2.96569 13.0343C3.11571 13.1843 3.2 13.3878 3.2 13.6V15.2C3.2 15.4122 3.11571 15.6157 2.96569 15.7657C2.81566 15.9157 2.61217 16 2.4 16Z" fill="#F5EEE6"/>
                      <path d="M15.2 16H13.6C13.3878 16 13.1843 15.9157 13.0343 15.7657C12.8843 15.6157 12.8 15.4122 12.8 15.2V13.6C12.8 13.3878 12.8843 13.1843 13.0343 13.0343C13.1843 12.8843 13.3878 12.8 13.6 12.8H15.2C15.4122 12.8 15.6157 12.8843 15.7657 13.0343C15.9157 13.1843 16 13.3878 16 13.6V15.2C16 15.4122 15.9157 15.6157 15.7657 15.7657C15.6157 15.9157 15.4122 16 15.2 16Z" fill="#F5EEE6"/>
                      <path d="M8.8 15.2H7.2C6.98783 15.2 6.78434 15.1157 6.63431 14.9657C6.48429 14.8157 6.4 14.6122 6.4 14.4V12.8C6.4 12.5878 6.48429 12.3843 6.63431 12.2343C6.78434 12.0843 6.98783 12 7.2 12H8.8C9.01217 12 9.21566 12.0843 9.36569 12.2343C9.51571 12.3843 9.6 12.5878 9.6 12.8V14.4C9.6 14.6122 9.51571 14.8157 9.36569 14.9657C9.21566 15.1157 9.01217 15.2 8.8 15.2Z" fill="#F5EEE6"/>
                      <path d="M8 9.5344C9.43634 9.5364 10.8187 10.082 11.8693 11.0614C12.9198 12.0409 13.5607 13.3817 13.6632 14.8144H15.2632C15.1637 12.9553 14.3551 11.2051 13.0039 9.92433C11.6527 8.64353 9.86177 7.92962 8 7.92962C6.13823 7.92962 4.34734 8.64353 2.99615 9.92433C1.64495 11.2051 0.836324 12.9553 0.7368 14.8144H2.3368C2.43926 13.3817 3.08018 12.0409 4.13074 11.0614C5.18131 10.082 6.56366 9.5364 8 9.5344Z" fill="#F5EEE6"/>
                      <path d="M7.2 8H8.8V12.8H7.2V8Z" fill="#F5EEE6"/>
                    </g>
                  </svg>
                </button>
              }

              {
                (canVote !== 200) && (canVote !== 311) &&
                <button
                    className={classes.disApproveButton}
                >
                  Delegate
                  <svg className={classes.approveSvg} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g>
                      <path d="M8 1.6C8.55379 1.6 9.09514 1.76422 9.5556 2.07189C10.0161 2.37955 10.3749 2.81685 10.5869 3.32849C10.7988 3.84012 10.8542 4.40311 10.7462 4.94625C10.6382 5.4894 10.3715 5.98831 9.9799 6.3799C9.58831 6.77149 9.0894 7.03816 8.54625 7.1462C8.00311 7.25424 7.44012 7.19879 6.92849 6.98686C6.41685 6.77494 5.97955 6.41605 5.67188 5.9556C5.36422 5.49514 5.2 4.95379 5.2 4.4C5.2 3.65739 5.495 2.9452 6.0201 2.4201C6.5452 1.895 7.25739 1.6 8 1.6ZM8 0C7.12976 0 6.27907 0.258055 5.55549 0.741534C4.83191 1.22501 4.26796 1.9122 3.93493 2.71619C3.6019 3.52019 3.51477 4.40488 3.68454 5.2584C3.85432 6.11191 4.27338 6.89592 4.88873 7.51127C5.50408 8.12662 6.28809 8.54568 7.1416 8.71546C7.99512 8.88523 8.87981 8.79809 9.68381 8.46507C10.4878 8.13204 11.175 7.56809 11.6585 6.84451C12.1419 6.12093 12.4 5.27024 12.4 4.4C12.4 3.82218 12.2862 3.25003 12.0651 2.71619C11.8439 2.18236 11.5198 1.69731 11.1113 1.28873C10.7027 0.880152 10.2176 0.556051 9.68381 0.33493C9.14997 0.113809 8.57782 0 8 0Z" fill="#F5EEE6"/>
                      <path d="M2.4 16H0.8C0.587827 16 0.384344 15.9157 0.234315 15.7657C0.0842855 15.6157 0 15.4122 0 15.2V13.6C0 13.3878 0.0842855 13.1843 0.234315 13.0343C0.384344 12.8843 0.587827 12.8 0.8 12.8H2.4C2.61217 12.8 2.81566 12.8843 2.96569 13.0343C3.11571 13.1843 3.2 13.3878 3.2 13.6V15.2C3.2 15.4122 3.11571 15.6157 2.96569 15.7657C2.81566 15.9157 2.61217 16 2.4 16Z" fill="#F5EEE6"/>
                      <path d="M15.2 16H13.6C13.3878 16 13.1843 15.9157 13.0343 15.7657C12.8843 15.6157 12.8 15.4122 12.8 15.2V13.6C12.8 13.3878 12.8843 13.1843 13.0343 13.0343C13.1843 12.8843 13.3878 12.8 13.6 12.8H15.2C15.4122 12.8 15.6157 12.8843 15.7657 13.0343C15.9157 13.1843 16 13.3878 16 13.6V15.2C16 15.4122 15.9157 15.6157 15.7657 15.7657C15.6157 15.9157 15.4122 16 15.2 16Z" fill="#F5EEE6"/>
                      <path d="M8.8 15.2H7.2C6.98783 15.2 6.78434 15.1157 6.63431 14.9657C6.48429 14.8157 6.4 14.6122 6.4 14.4V12.8C6.4 12.5878 6.48429 12.3843 6.63431 12.2343C6.78434 12.0843 6.98783 12 7.2 12H8.8C9.01217 12 9.21566 12.0843 9.36569 12.2343C9.51571 12.3843 9.6 12.5878 9.6 12.8V14.4C9.6 14.6122 9.51571 14.8157 9.36569 14.9657C9.21566 15.1157 9.01217 15.2 8.8 15.2Z" fill="#F5EEE6"/>
                      <path d="M8 9.5344C9.43634 9.5364 10.8187 10.082 11.8693 11.0614C12.9198 12.0409 13.5607 13.3817 13.6632 14.8144H15.2632C15.1637 12.9553 14.3551 11.2051 13.0039 9.92433C11.6527 8.64353 9.86177 7.92962 8 7.92962C6.13823 7.92962 4.34734 8.64353 2.99615 9.92433C1.64495 11.2051 0.836324 12.9553 0.7368 14.8144H2.3368C2.43926 13.3817 3.08018 12.0409 4.13074 11.0614C5.18131 10.082 6.56366 9.5364 8 9.5344Z" fill="#F5EEE6"/>
                      <path d="M7.2 8H8.8V12.8H7.2V8Z" fill="#F5EEE6"/>
                    </g>
                  </svg>
                </button>
              }

            </div>
        )}

        <div className={classes.voteMain}>
          <div className={classes.voteHeader}>
            <div className={classes.voteHeaderText}>
              Delegates
            </div>
            <div className={classes.voteHeaderNum}>
              {voteCount}
            </div>
          </div>
          <div className={classes.voteList}>
            {voteList.map(item => (
                <div key={item.id}>
                  <div className={classes.voteContent}>
                    <div className={classes.voteListChild}>
                      <AddressAvatar address={item.fromAddress} size={20} />
                      <div className={classes.voteUserAddress}>{item.fromAddress} </div>
                      {/*<div>X3 vote</div>*/}
                    </div>
                  </div>

                </div>
            ))}
          </div>

        </div>

        {proposal && (
                <div>
                  <div style={{ height: 30 }}></div>
                  {/*<h2>Comments</h2>*/}
                  <Comments applicationId={Number(id)} />
                </div>
            )}

      </Container>
    </>
  );
};

export default Application;
