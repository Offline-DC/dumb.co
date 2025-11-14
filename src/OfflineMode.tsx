import './OfflineMode.css';
import ReactPlayer from 'react-player';
let s3URL = "https://offlinebucket1.s3.us-east-2.amazonaws.com";

export default function OfflineMode() {
  return (
    <div className="offline-mode-container">
    <div>
        <div className="center">
            <h1 className="title om">
                Offline Mode Setup
            </h1>
        </div>
        <p className='om'>
            Welcome to your Month Offline! On this page are several links, instructions, and videos to help you enable 'Offline Mode' on your iPhone. If you have an Android device, sorry, we hope to bring Offline Mode to you soon! 
        </p>
        <p className='om'>
            Offline Mode was built to allow you to switch back and forth between a smartphone and a dumbphone with ease. You don't always need to be on a smartphone, but sometimes, it's good to have for specific purposes. With Offline Mode, you can easily move from one context to the other. Assuming you have text message forwarding set up from your smartphone to your desktop, now you can be on your dumbphone with a different number and still be reachable, but unburdened by having the internet on your person at all times.
          </p>
          <p className='om'>
             With Offline Mode, you can forward texts and calls from your smartphone to your dumbphone, and send automatic away messages which you can customize. When you want to be on your smartphone, easily turn the Offline Mode focus off and use your smartphone as you normally would. 
        </p>
        <p className='om'>
            The setup process is fairly straight-forward, but please read carefully and don't skip any steps!
            </p>
        <div className='center'>
            <h1 className='om'>
                Step 1: Download
            </h1>
         </div>
        <p className='om'>
            Okay, let's get started. Download the <a href="https://apps.apple.com/us/app/data-jar/id1453273600" className="om" target="_blank" rel="noopener noreferrer">Data Jar app</a> from the iOS App Store.
        </p>
        <div className="flex-row">
            <div className="flex-1">
                <p className='small-p om'>
                    Next, CLICK EACH of the following links to install the shortcuts you'll need to set up Offline Mode. Press "Add Shortcut" for each link to add to your Shortcuts app.
                </p>
                <div className='links-container'>
                    <h2 className='om'>
                        * <a href="https://www.icloud.com/shortcuts/4a7827c94cc4454a981a711a68899c76" className="om" target="_blank" rel="noopener noreferrer">Init. DataJar</a>
                    </h2>
                    <h2 className='om'>
                        * <a href="https://www.icloud.com/shortcuts/08b251c689964ea2be623311a5057a85" className="om" target="_blank" rel="noopener noreferrer">Offline Mode</a>
                    </h2>
                    <h2 className='om'>
                        * <a href="https://www.icloud.com/shortcuts/002e4a1f63ef493b988735bd2e0f25bc" className="om" target="_blank" rel="noopener noreferrer">Mode On</a>
                    </h2>
                    <h2 className='om'>
                        * <a href="https://www.icloud.com/shortcuts/ef82490e4ae94aadb5421a6f2bc55fa2" className="om" target="_blank" rel="noopener noreferrer">Mode Off</a>
                    </h2>
                </div>
            </div>
            <div className="flex-image">
                <img src="https://www.offline.community/img/download_offline_mode.PNG" alt="Focus On Automation" className="image om"></img>
            </div>
        </div>
</div>
  

  <p className='om'>
    Make sure you have downloaded DataJar and have installed all FOUR shortcuts.
  </p>
  <div className="center">
    <h1 className='om'>
      Step 2: Focus Mode
    </h1>
    </div>
  <div className="flex-row">     
    <div className="flex-image">
              <ReactPlayer url={`${s3URL}/create_focus.mp4`} muted controls volume={0} width='auto'/>
    </div>
    <div className='flex-2'>
<p className='small-p om'>
    Create a new Focus Mode on your iPhone called "Offline". This will allow you to easily turn the Offline Mode shortcuts on and off.     Go into your iPhone Settings and click on "Focus". Then click on the plus on the top right of the screen. Add a Custom Focus Mode and name it "Offline". You can choose whatever color and symbol you like.
  </p>
      </div>
  </div>
<div className="center">
    <h1 className='om'>
      Step 3: Automations
    </h1>
    </div>
  <p className='om'>
    Make sure you have the Shortcuts App installed on your iPhone. You can download it <a href="https://apps.apple.com/us/app/shortcuts/id915249334" className="om" target="_blank" rel="noopener noreferrer">here</a> if not.
  </p>
  <p className='om'>
    Open up the Shortcuts App on your iPhone. Navigate to the "Automation" tab at the bottom of the screen. You'll be adding three automations here.
  </p>
    <div className="player-wrapper">
        <ReactPlayer className="react-player" url={`${s3URL}/focus_automation.mp4`} muted controls volume={0} width='100%' height='100%'/>
      </div>
    <div className="flex-row">
      <div className="flex-1">
        <p className='medium-p om'>
          The first automation is triggered when you turn the Offline Focus mode on. Click the plus on the the top right of the screen. Then click "Create Personal Automation". Scroll down and select the "Offline" Focus. Check the box that says "When Turning On". 
        </p>
      </div>
      <div className="flex-image">
        <img src="https://www.offline.community/img/focus_on.PNG" alt="Focus On Automation" className="image om"></img>
      </div>
    </div>

    <div className="flex-row">
      <div className="flex-1">
        <p className='medium-p om'>
          Click Next, then click "Add Action". Search for "Run Shortcut" and select it. Then select the "Offline Mode On" shortcut you installed earlier. Click Next, then click "Done". Make sure you have "Run Immediately" selected.
        </p>
      </div>
      <div className="flex-image">
        <img src="https://www.offline.community/img/run_offline_on.PNG" alt="Focus On Automation" className="image om"></img>
      </div>
    </div>

    <div className="flex-row">
      <div className="flex-image">
        <img src="https://www.offline.community/img/focus_off.PNG" alt="Focus On Automation" className="image om"></img>
      </div>
      <div className="flex-1">
        <p className='small-p om'>
          The second automation is triggered when you turn the Offline Focus mode off. Second verse, same as the first. Click the plus on the top right of the screen. Click "Create Personal Automation". Scroll down and select "Offline" focus again. This time, check the box that says "When Turning Off".
        </p>
      </div>
    </div>

    <div className="flex-row">
      <div className="flex-image">
        <img src="https://www.offline.community/img/run_offline_off.PNG" alt="Focus On Automation" className="image om"></img>
      </div>
      <div className="flex-1">
        <p className='medium-p om'>
          Click Next, then click "Add Action". Search for "Run Shortcut" and select it. Then select the "Offline Mode Off" shortcut you installed earlier. Click Next, then click "Done". Again, make sure you have "Run Immediately" selected.
        </p>
      </div>
    </div>
  <p className='om'>
    One more to go. Add another personal automation, this time, click on the Message option. Click 'choose" on the bar with the 'Message Contains' prompt. TYPE A SIINGLE SPACE and click 'Done'. From there, in the "Do" section, click "New Blank Automation". Pay close attention here:
  </p>
    <div className="player-wrapper">
        <ReactPlayer className="react-player" url={`${s3URL}/message_automation.mp4`} muted controls volume={0} width='100%' height='100%'/>
      </div>
<div className="flex-row">
      <div className="flex-1">
        <p className='small-p om'>
          You'll need to add two actions from the Data Jar shortcuts. Type "Set Value" to search for those shortcuts. These two actions will pass the sender's phone number and the content of the message being sent to you to the Offline Mode app so that you can forward the message to your Dumbphone and reply to the Sender with an away message if you so choose.
        </p>
      </div>
      <div className="flex-image">
        <img src="https://www.offline.community/img/message.PNG" alt="Focus On Automation" className="image om"></img>
      </div>
    </div>

    <div className="flex-row">
      <div className="flex-1">
        <p className='small-p om'>
          Set message to the Shortcut Input for the message and sender to the Shortcut Input for the sender. You might need to press and hold to be able to select "Shortcut Input". Click on Shortcut Input to be able to select either "message" or "sender". See the following images for reference.
        </p>
      </div>
      <div className="flex-image">
        <img src="https://www.offline.community/img/sender.PNG" alt="Focus On Automation" className="image om"></img>
      </div>
    </div>

  <p className='om'>
    Then, search for "Run Shortcut" and select it. Select the "Offline Mode" shortcut you installed earlier. Click Next, then click "Done". After everything, that Message triggered automation should look like this:
  </p>
  <div className="links-container center">
        <img src="https://www.offline.community/img/message_automation.PNG" alt="Focus On Automation" className='image center'></img>     
        </div>
        <div className="center">
    <h1 className='om'>
      Step 4: Data Jar
    </h1>
    </div>
        <p className='om'>Now, it's time for the final step! Navigate back to all your shortcuts and click on the Shortcut that says "Initialize Offline Mode DataJar" once. Open up your Data Jar app. You can delete this shortcut after you have successfully initialized the data jar.</p>

       <div className="player-wrapper">
        <ReactPlayer className="react-player" url={`${s3URL}/datajar_automation.MP4`} muted controls volume={0} width='100%' height='100%'/>
      </div>
      <p className='om'>
        Then, from within the Data Jar Store, you can set your dumbphone number, your away message, the shortcodes for call forwarding and can toggle whether or not you want to send an away message, forward texts to your dumbphone, and automatically bring up the dialer for call forwarding whenever you turn the Offline Mode focus on and off.
      </p>
          <p className='om'>
        You may need to restart your device for the automations to take effect.
      </p>
      <div className='center'>
      <h1 className='om'>Call Forwarding</h1>
      </div>
      <p className='om'>You can use the following links to find the shortcodes for your mobile provider to input into your datajar. You will need to include your dumbphone number in the input field for 'linkStartCallForward' e.g. '%2a%2a21%2a. '%2a' is the code for a '*' and '%23' is the code for a '#'.</p>
      <p className='om'>
        * <a href='https://www.verizon.com/articles/verizon-unlimited-plans/call-forwarding-everything-you-need-to-know/' className="om" target="_blank" rel="noopener noreferrer">Verizon</a>
      </p>
       <p className='om'>
        * <a href='https://www.t-mobile.com/support/plans-features/self-service-short-codes' className="om" target="_blank" rel="noopener noreferrer">T-Mobile</a>
      </p>
       <p className='om'>
        * <a href='https://www.att.com/support/article/u-verse-voice/KM1000459/' className="om" target="_blank" rel="noopener noreferrer">AT&T</a>
      </p>
      <div className='center'>
      <h1 className='om'>Notifications</h1>
      </div>
      <p className='om'>
        You can disable the notifications for shortcuts so that you don't get notified every time you recieve a text message that your shortcut is checking to see if Offline Mode is on or off. <br></br><br></br>Go to Settings &#8594; Screen Time &#8594; See All App & Website Activity &#8594; Scroll all the way to the bottom to see notifications, click on 'Shortcuts' &#8594; toggle the button that says 'Allow Notifications'.
      </p>
      <div className='center'>
      <h1 className='om'>That's It!</h1>
      </div>
      <p className='om'>
        You're all set up! To turn Offline Mode on, just turn on the Offline Focus mode you created. To turn it off, just turn off the Offline Focus mode.<br></br><br></br> Enjoy your Month Offline!
      </p>
      <div className="center">
    <h1 className="om">
      <a href="/" className="om">Less is M.O.</a>
    </h1>
    </div>
<div className='center'>
<p className='text-align om'>
        © 2025 Offline DC Inc. 
      </p>
      </div>
    </div>
  );
}