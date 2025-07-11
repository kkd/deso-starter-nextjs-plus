// components/Notification/Notification.js
"use client";

import { 
    NotificationDefault, 
    NotificationFollow, 
    NotificationSubmitPost,
    NotificationDiamond,
    NotificationReaction,
    NotificationTransfer  
} from './types/';

export const Notification = ({ notification, postsByHash, profilesByPublicKey }) => {
    const { Metadata } = notification;

    const txnType = Metadata?.TxnType;
    const publicKey = Metadata?.TransactorPublicKeyBase58Check;
    const profile = profilesByPublicKey?.[publicKey];

    const transferMeta = Metadata?.BasicTransferTxindexMetadata;

    // related to SUBMIT_POST notifications
    const { SubmitPostTxindexMetadata: submitMeta } = Metadata || {};
    const submittedPost = postsByHash?.[submitMeta?.PostHashBeingModifiedHex];
    const submittedPostHex = submitMeta?.PostHashBeingModifiedHex;
    const parentPost = postsByHash?.[submitMeta?.ParentPostHashHex];

    // related to Diamond notifications
    const isDiamond =
        transferMeta?.DiamondLevel > 0 &&
        transferMeta?.PostHashHex &&
        transferMeta.PostHashHex.length > 0;   
        
    // related to Reaction notifications
    const isReaction = Metadata?.CreatePostAssociationTxindexMetadata?.AssociationType === 'REACTION';

    const isFocusTip = Metadata?.CreatePostAssociationTxindexMetadata?.AssociationType === 'DIAMOND' && 
        Metadata?.CreatePostAssociationTxindexMetadata?.AppPublicKeyBase58Check === 'BC1YLjEayZDjAPitJJX4Boy7LsEfN3sWAkYb3hgE9kGBirztsc2re1N' 

    switch (txnType) {
        case 'FOLLOW':
            return (
                <NotificationFollow
                    profile={profile}
                    publicKey={publicKey}
                    isUnfollow={Metadata?.FollowTxindexMetadata?.IsUnfollow}
                />
            );
        case 'SUBMIT_POST': 
            return (
                <NotificationSubmitPost
                    profile={profile}
                    publicKey={publicKey}
                    submittedPost={submittedPost}
                    submittedPostHex={submittedPostHex}
                    parentPost={parentPost}
                />
            ); 
        case 'SUBMIT_POST': 
            return (
                <NotificationSubmitPost
                    profile={profile}
                    publicKey={publicKey}
                    submittedPost={submittedPost}
                    parentPost={parentPost}
                />
            );      
        case 'BASIC_TRANSFER': {
            if (isDiamond) {
                const post = postsByHash?.[transferMeta.PostHashHex];
                return (
                    <NotificationDiamond
                        profile={profile}
                        publicKey={publicKey}
                        post={post}
                        diamondLevel={transferMeta.DiamondLevel}
                    />
                );
            }

            return (
                <NotificationTransfer
                    profile={profile}
                    publicKey={publicKey}
                    nanosAmount={transferMeta?.TotalOutputNanos}
                />
            );            
        };
        case 'CREATE_POST_ASSOCIATION': {
            if (isReaction) {
                const post = postsByHash?.[Metadata?.CreatePostAssociationTxindexMetadata?.PostHashHex];
                const reaction = Metadata?.CreatePostAssociationTxindexMetadata?.AssociationValue
                return (
                    <NotificationReaction
                        profile={profile}
                        publicKey={publicKey}
                        post={post}
                        reaction={reaction}
                    />
                );
            }

            if (isFocusTip) {
                const post = postsByHash?.[Metadata?.CreatePostAssociationTxindexMetadata?.PostHashHex];
                return (
                    <NotificationDiamond
                        profile={profile}
                        publicKey={publicKey}
                        post={post}
                        isFocusTip={true}
                    />
                );
            }

            return <NotificationDefault notification={notification} />;
        };                          
        default:
            return <NotificationDefault notification={notification} />;
    }
};