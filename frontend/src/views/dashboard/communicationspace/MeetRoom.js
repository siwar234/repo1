import React from 'react'
import { useParams } from 'react-router-dom'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

const MeetRoom = () => {
  const {roomID}=useParams();
  console.log("🚀 ~ file: RoomPage.js:8 ~ RoomPage ~ roomID:", roomID)
  const myMeeting = async (element) => {
      // generate Kit Token
       const appID = 360931116	 ;
       const serverSecret = "a58b8e7c47516ea335d4a24163ddb160";
       const kitToken =  ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomID,  Date.now().toString() ," /add user name/");
       const zp = ZegoUIKitPrebuilt.create(kitToken);
       zp.joinRoom({
          container: element,
       scenario: {
          mode: ZegoUIKitPrebuilt.GroupCall // To implement 1-on-1 calls, modify the parameter here to [ZegoUIKitPrebuilt.OneONoneCall].
        },
      })
  }

  
  return (
   <>
   
    <div
      className="myCallContainer"
      ref={myMeeting}
      style={{ width: '70vw', height: '80vh' }}
    ></div>
   </>
  )
}

export default MeetRoom