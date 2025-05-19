// pages/[keyword]/hashtagPage.jsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/hashPage.module.css';
import PieChart from '../hashtagSubPage/piehash';
import MentionCountLineGraph from '../hashtagSubPage/mentionCountLineGraph';
import ReachCountLineGraph from '../hashtagSubPage/reachCountLineGraph';
import SentimentGraph from '../hashtagSubPage/sentimentCount';

function HashtagPage() {
  const { query } = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [runName, setRunName] = useState('');
  const [selectedDay, setDayData] = useState('7days');
  const [hashtagData, setHashtagData] = useState([]);

  useEffect(() => {
    const userEmail = sessionStorage.getItem('userEmail');
    const keywordName = sessionStorage.getItem('keywordName');
    const hashtagData = JSON.parse(sessionStorage.getItem('hashtagData'));

    if (userEmail) setUserEmail(userEmail);
    if (keywordName) setRunName(keywordName);
    if (hashtagData) setHashtagData(hashtagData);
  }, []);

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleClickOutside = (event) => {
    if (!event.target.matches(`.${styles.dropbtn}`) && !event.target.matches(`.${styles.dropbtnImg}`)) {
      setIsDropdownOpen(false);
    }
  };

  const handleChange = (event) => {
    setDayData(event.target.value);
  };

  useEffect(() => {
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const applyLimit = (data, limit) => {
    return data.slice(-limit);
  };

  const limitedData = selectedDay === '7days' ? applyLimit(hashtagData, 7) : applyLimit(hashtagData, 30);

  const totalPositiveCount = limitedData.reduce((total, entry) => total + entry.positiveMentionCount, 0);
  const totalNegativeMentions = limitedData.reduce((total, entry) => total + entry.negativeMentionCount, 0);
  const formattedTotalMentions = new Intl.NumberFormat().format(totalPositiveCount + totalNegativeMentions);

  const totalSocialMediaReach = limitedData.reduce((total, entry) => total + entry.socialReach, 0);
  const formattedTotalSocialMediaReach = new Intl.NumberFormat().format(totalSocialMediaReach);

  const totalNonSocialMediaReachData = limitedData.reduce((total, entry) => total + entry.nonSocialReach, 0);
  const formattedTotalNonSocialMediaReachData = new Intl.NumberFormat().format(totalNonSocialMediaReachData);

  return (
    <div className={styles.screen}>
      <div className={styles.sidebar}>
        <img src="/pic/mangomango.jpg" alt="MangoMango" className={styles.sidebarImg} />
        <p className={styles.sidebarP}>mango mango</p>
        <ul>
          <li><a href={`/${query.keyword}/visualPage`} className={styles.sidebarA}>Dashboard</a></li>
          <li><a href={`/${query.keyword}/hashtagPage`} className={styles.sidebarA}><b>Hashtag Analytics</b></a></li>
        </ul>
        <a href="/searchPage" className={styles.backToSearch}><img src="/pic/back_to_search.png" alt="backToSearch" /></a>
      </div>
      <div className={styles.dash}>
        <div className={styles.header}>
          <p className={styles.Dashboard}>Hashtag Analysis</p>
          <div className={styles.dropdown}>
            <button onClick={handleDropdownToggle} className={styles.dropbtn}>
              <img src="https://icons.veryicon.com/png/o/internet--web/prejudice/user-128.png" alt="Dropdown" className={styles.dropbtnImg} />
            </button>
            <div id="myDropdown" className={`${styles.dropdownContent} ${isDropdownOpen ? styles.show : ''}`}>
              <div className={styles.accountProfile}>
                <img src="https://icons.veryicon.com/png/o/internet--web/prejudice/user-128.png" alt="User" className={styles.profileImg} />
                <p>{userEmail}</p>
              </div>
              <a href="#">Manage account</a>
              <a href="#">Notification</a>
              <a href="/" className={styles.Logout}>Logout</a>
            </div>
          </div>
        </div>
        <div className={styles.runName}>
          <h1>{runName}</h1>
          <div className={styles.selectBox}>
            <select className={styles.selectLast} value={selectedDay} onChange={handleChange}>
              <option className={styles.customOption} value="7days">Last 7 days</option>
              <option className={styles.customOption} value="30days">Last 30 days</option>
            </select>
          </div>
        </div>
        <div className={styles.board}>
          <div className={styles.boardHashUp}>
            <div className={styles.boardHashUpdivData}>
              <div className={styles.boardHashdivDataVisual}>
                <img src="/pic/mention2.png" alt="mention" className={styles.DataImgMention} />
              </div>
              <div className={styles.boardHashdivDataVisual}>
                <div className={styles.mentionNumber}>{formattedTotalMentions}</div>
                <div className={styles.mentionFont}>Mention Counts</div>
              </div>
            </div>
            <div className={styles.boardHashUpdivData}>
              <div className={styles.boardHashdivDataVisual}>
                <img src="/pic/smile.png" alt="mention" className={styles.DataImgSmile} />
              </div>
              <div className={styles.boardHashdivDataVisual}>
                <div className={styles.positiveNumber}>{new Intl.NumberFormat().format(totalPositiveCount)}</div>
                <div className={styles.mentionFont}>Positive Mention</div>
              </div>
            </div>
            <div className={styles.boardHashUpdivData}>
              <div className={styles.boardHashdivDataVisual}>
                <img src="/pic/sad.png" alt="mention" className={styles.DataImgSad} />
              </div>
              <div className={styles.boardHashdivDataVisual}>
                <div className={styles.negativeNumber}>{new Intl.NumberFormat().format(totalNegativeMentions)}</div>
                <div className={styles.mentionFont}>Negative Mention</div>
              </div>
            </div>
            <div className={styles.boardHashUpdivData}>
              <div className={styles.boardHashdivDataVisual}>
                <img src="/pic/wifi.png" alt="mention" className={styles.DataImgWifi} />
              </div>
              <div className={styles.boardHashdivDataVisual}>
                <div className={styles.mentionNumber}>{formattedTotalSocialMediaReach}</div>
                <div className={styles.mentionFont}>Social Media Reach</div>
              </div>
            </div>
            <div className={styles.boardHashUpdivData}>
              <div className={styles.boardHashdivDataVisual}>
                <img src="/pic/nonwifi.png" alt="mention" className={styles.DataImgNonWifi} />
              </div>
              <div className={styles.boardHashdivDataVisual}>
                <div className={styles.mentionNumber}>{formattedTotalNonSocialMediaReachData}</div>
                <div className={styles.mentionFont}>Nonsocial Media Reach</div>
              </div>
            </div>
          </div>
          <div className={styles.boardHashDown}>
            <div className={styles.boardHashUpdiv}>
              <div>
                <div className={styles.sourcetype}>Source Type</div>
                <div className={styles.centerGraph}>
                  <PieChart data={limitedData} />
                </div>
              </div>
            </div>
            <div className={styles.boardHashDownColumn}>
              <div className={styles.boardHashDowndiv}>
                <div className={styles.hashLineGraph}>
                  <p className={styles.numMention}>Number of Mentions</p>
                  <MentionCountLineGraph data={limitedData} />
                </div>
              </div>
              <div className={styles.boardHashDowndiv}>
                <div className={styles.hashLineGraph}>
                  <p className={styles.numMention}>Number of Reach</p>
                  <ReachCountLineGraph data={limitedData} />
                </div>
              </div>
              <div className={styles.boardHashDowndiv}>
                <div className={styles.hashLineGraph}>
                  <p className={styles.numMention}>Sentiment</p>
                  <SentimentGraph data={limitedData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HashtagPage;
