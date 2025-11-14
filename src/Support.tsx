import { IconTemperature } from '@tabler/icons-react';
import React, { useState } from 'react';
import type { Dispatch, SetStateAction } from "react";
import './Support.css';
import ReactPlayer from 'react-player';
import supportItemsData from './supportItems.json';
const supportItems: SupportItem[] = supportItemsData as SupportItem[]; // Assuming support items are stored in a JSON file
let s3URL = "https://offlinebucket1.s3.us-east-2.amazonaws.com";

type SupportItem = {
    title: string,
    description: string,
    sequenceNumber: number,
    buttonText: string,
    buttonText2: string,
    buttonURL: string,
    buttonURL2: string,
    imageURL: string,
    hasButton: boolean,
    hasButton2: boolean,
    hasBack: boolean,
    hasNext: boolean,
    hasHelp: boolean,
}

type SupportWindowProps = SupportItem & {
    onNext?: () => void;
    onBack?: () => void;
    i: number
}

function ProgressBar({ filled }: { filled: number }) {
  const total = 8;
  return (
    <div className="progress-bar">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`progress-rect${i < filled ? ' filled' : ''}`}
        />
      ))}
    </div>
  );
}

function Modal({ onClose }: { onClose: () => void }) {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className='title-bar'>
                    <h3>Warning: Proceed With Caution</h3>
                    <div className="title-bar-buttons">
                        <button className="title-bar-button" onClick={onClose}><img src="/img/windows95icons/Cross.ico"></img></button>
                    </div>
                </div>
                <div className='modal-block'>
                    <img src="/img/windows95icons/Warning.ico" style={{width:"50px", boxShadow:"none"}}></img>
                    <p style={{textAlign:"left"}}>
                        Flipping off your touchscreen may result in spontaneous joy, increased whimsy, and a profound sense of connection to the world around you.
                    </p>
                </div>
                <button className="bottom-nav-button" onClick={onClose} style={{marginBottom:"10px"}}>COOL</button>
            </div>
        </div>
    );
}

function SupportWindow({
    title, description, sequenceNumber, imageURL, buttonText, buttonText2, buttonURL, buttonURL2,
    hasButton, hasButton2, hasBack, hasNext, hasHelp, onNext, onBack, i, onHelp,
}: SupportWindowProps & { onHelp?: () => void }) {
    return (
        <div className='support-window'>
            <div className="grid-container">
                <div className="grid-item-1">
                </div>
                <div className="grid-item-2">
                    <h2 style={{color:"black"}}>
                        {title.split('\n').map((line, idx) => (
                            <React.Fragment key={idx}>
                            {line}
                            <br />
                            </React.Fragment>
                        ))}
                    </h2>
                    <p style={{color:"black"}}>
                        {description.split('\n').map((line, idx) => (
                            <React.Fragment key={idx}>
                            {line}
                            <br />
                            </React.Fragment>
                        ))}
                    </p>
                    <div className="gif-button-container">
                        {imageURL &&
                        (<img style={{minHeight:"50px",minWidth:"50px",maxHeight:"120px",maxWidth:"150px",marginTop:"15px"}} src={imageURL}></img>)}
                        {hasButton && 
                        (<button><a target="_blank" href={buttonURL}>{buttonText}</a></button>)}
                        {hasButton2 && 
                        (<button style={{marginLeft:"10px"}}><a target="_blank" href={buttonURL2}>{buttonText2}</a></button>)}
                    </div>
                     <ProgressBar filled={i}/>
                </div>
            </div>
            <div className="bottom-navigation">
                {hasBack &&
                (<button className="bottom-nav-button" onClick={onBack}>{'\u2039'} Back</button>)}
                {hasNext &&
                (<button className="bottom-nav-button" onClick={onNext}>Next  {'\u203A'}</button>)}
                {hasHelp &&
                (<button className="bottom-nav-button" style={{marginLeft:"10px"}}><a href="/">Home</a></button>)}
            </div>
            </div>
    );
}

export default function Support() {
    const [index, setIndex] = useState(0);
    const incrementIndex = () => setIndex((prev) => Math.min(prev + 1, supportItems.length - 1));
    const decrementIndex = () => setIndex((prev) => Math.max(prev - 1, 0));
    const [showHelpModal, setShowHelpModal] = useState(false);
const handleHelpClick = () => setShowHelpModal(true);
const handleCloseModal = () => setShowHelpModal(false);

  return (
        <div className='teal vt323-regular'>
            {showHelpModal && (<Modal onClose={handleCloseModal} />)}
            <div className="setup-container">
                <div className="title-bar">
                    <h3>Offline Support</h3>
                    <div className="title-bar-buttons">
                        <button className="title-bar-button" onClick={handleHelpClick}><img src="/img/windows95icons/Help 3D.ico"></img></button>
                    </div>
                </div>
                <SupportWindow {...supportItems[index]} i={index} onNext={incrementIndex}
                    onBack={decrementIndex}
                      onHelp={handleHelpClick}
 />
            </div>
        </div>

  );
}