import React, { useEffect, useRef, useState } from 'react';
import { DeltaStatic, Quill } from 'quill';
import QuillEditor, { EMPTY_DELTA } from '../QuillEditor';
import { CommentModal } from '../Comments';
import { useAppSelector } from '../../hooks';
import { ApiWrapper } from '@nouns/frontinus-house-wrapper';
import { Comment } from '@nouns/frontinus-house-wrapper/dist/builders';
import { useAccount, useWalletClient } from 'wagmi';
import ConnectButton from '../ConnectButton';
import classes from '../../pages/Create/Create.module.css';

type CreateCommentWidgetProps = {
  proposalId?: number;
  applicationId?: number;
  onCommentCreated: (comment: CommentModal) => void;
}

export default function CreateCommentWidget(props: CreateCommentWidgetProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [quill, setQuill] = useState<Quill | undefined>(undefined);

  const { address: account } = useAccount();
  const { data: walletClient } = useWalletClient();
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new ApiWrapper(host, walletClient));

  useEffect(() => {
    client.current = new ApiWrapper(host, walletClient);
  }, [walletClient, host]);

  const handleChange = (deltaContent: DeltaStatic, htmlContent: string, plainText: string) => {
    if (plainText.trim().length === 0) {
      setContent('');
    } else {
      setContent(JSON.stringify(deltaContent.ops));
    }
  };

  const submit = async () => {

    console.log(content);
    if (content.length === 0 || !account) {
      return;
    }

    setLoading(true);

    const commentCreateResponse = await client.current.createComment({
      content: content,
      applicationId: props.applicationId,
      proposalId: props.proposalId,
    } as Comment);
    if (commentCreateResponse) {
      props.onCommentCreated(commentCreateResponse);
      if (quill) {
        quill.setContents(EMPTY_DELTA);
      }
    }

    setLoading(false);
  };

  return (<>
    <QuillEditor
      widgetKey={'Comment-' + props.proposalId}
      onChange={handleChange}
      title='Create Comment'
      loading={loading}
      minHeightStr={'100px'}
      onQuillInit={(q) => setQuill(q)}
      btnText='Submit'
      onButtonClick={submit}
      placeholderText=''
    />
    {/*{account ? (*/}
    {/*  <Button text={'submit'} bgColor={ButtonColor.Purple} onClick={submit} />*/}
    {/*) : (*/}
    {/*  <ConnectButton*/}
    {/*    classNames={classes.actionBtn}*/}
    {/*    color={ButtonColor.Pink}*/}
    {/*    text='submit'*/}
    {/*  />)*/}
    {/*}*/}

  </>);
}