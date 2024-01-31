import classes from './BIPRightCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import clsx from 'clsx';
import TruncateThousands from "../TruncateThousands";
import {countDecimals} from "../../utils/countDecimals";
import {isInfAuction} from "../../utils/auctionType";
import Button, {ButtonColor} from "../Button";
import {clearProposal} from "../../state/slices/editor";
import ConnectButton from "../ConnectButton";
import React from "react";
import {useTranslation} from "react-i18next";
import {useLocation, useNavigate} from "react-router-dom";
import {useAccount} from "wagmi";
import {getSlug} from "../../utils/communitySlugs";
import {useAppSelector} from "../../hooks";





const BIPRightCard: React.FC<{
    subtitle?: string | ReactElement;
    content: ReactElement;
}> = props => {
    const location = useLocation();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { address: account } = useAccount();
    const community1 = useAppSelector(state => state.propHouse.activeCommunity);
    const content = (
        <>
            <b>{t('howProposingWorks')}:</b>
            <div className={classes.bulletList}>
                <div className={classes.bulletItem}>
                    <hr className={classes.bullet} />
                    <div className={classes.customParagraph}>
                        <li>It functions similarly to snapshot voting. You present a proposal with multiple options for the community to vote on. </li>
                        <li>{community1 && community1.nftName} NFT owners will cast their votes on the proposed options within the proposal.</li>
                    </div>
                </div>
            </div>

            {
                account ? (
                    <Button
                        classNames={classes.margintop40}
                        text={'Create your proposal'}
                        bgColor={ButtonColor.Green}
                        onClick={() => {
                            navigate('/' + getSlug(location.pathname) + '/create-bip');
                        }}
                    />
                ) : (
                    <ConnectButton classNames={clsx('connectBtn',classes.margintop40)} color={ButtonColor.Pink} />
                )}
        </>
    );

    return (
        <Card
            bgColor={CardBgColor.White}
            borderRadius={CardBorderRadius.thirty}
            classNames={classes.sidebarContainerCard}
        >
            <>
                <div className={classes.sideCardHeader}>
                    <div
                        className={clsx(
                            classes.icon,
                        )}
                    >
                            <img src={'/lamp-icon.png'} style={{ width: '36px', height: '36px' }} />
                    </div>
                    <div className={classes.textContainer}>
                        <div className={classes.title}>Proposals Outside of Rounds</div>
                        <div className={classes.subtitle}></div>
                    </div>
                </div>
                <hr className={classes.divider} />
            </>
            <div className={classes.sideCardBody}>
                {content}
            </div>
        </Card>
    );
};
export default BIPRightCard;
