// pages/[keyword]/visualPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/visualPage.module.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PieChart from '../visualSubPage/PieChart';
import Histogram from '../visualSubPage/HistogramPeak';
import HistogramGender from '../visualSubPage/HistogramGender';
import { useSession } from 'next-auth/react';

const generateDateRange = (start, end) => {
    const dateRange = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
        dateRange.push(currentDate.toISOString().split('T')[0]); // Convert to 'YYYY-MM-DD' format
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateRange;
};

function parseDateString(dateString) {
    if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/').map(part => parseInt(part, 10));
        return new Date(year, month - 1, day);
    } else if (dateString.includes('-')) {
        return new Date(dateString); // Assuming it's already in 'YYYY-MM-DD' format
    } else {
        console.error('Unknown date format:', dateString);
        return new Date(NaN); // Invalid date
    }
}

function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}

function getEarliestAndLatestDates(data) {
    const dates = data.map(item => parseDateString(item.date)).filter(isValidDate);
    if (dates.length === 0) {
        return { earliestDate: null, latestDate: null };
    }
    const earliestDate = new Date(Math.min(...dates));
    const latestDate = new Date(Math.max(...dates));
    return { earliestDate, latestDate };
}

function VisualPage() {
    const { query } = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [runName, setRunName] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const datePickerRef = useRef(null);
    const [summedCounts, setSummedCounts] = useState({ totalMaleCount: 0, totalFemaleCount: 0 });
    const [selectedDates, setSelectedDates] = useState([]);
    const [data, setData] = useState([]);
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'authenticated') {
          sessionStorage.setItem('userEmail', session.user.email);
        }
    
        const storedUserEmail = sessionStorage.getItem('userEmail');
        const keywordName = sessionStorage.getItem('keywordName');
        const dashboardData = JSON.parse(sessionStorage.getItem('dashboardData'));
    
        if (storedUserEmail) setUserEmail(storedUserEmail);
        if (keywordName) setRunName(keywordName);
        if (dashboardData) {
          setData(dashboardData);
          const { earliestDate, latestDate } = getEarliestAndLatestDates(dashboardData);
          if (isValidDate(earliestDate) && isValidDate(latestDate)) {
            setStartDate(earliestDate);
            setEndDate(latestDate);
          }
        }
      }, [session, status]);

    const calculateSummedCountsForDateRange = (start, end) => {
        const startDateString = start.toISOString().split('T')[0];
        const endDateString = end.toISOString().split('T')[0];

        const filteredData = data.filter(item => {
            const itemDate = parseDateString(item.date);
            if (!isValidDate(itemDate)) {
                console.error('Invalid date encountered:', item.date);
                return false;
            }
            const itemDateString = itemDate.toISOString().split('T')[0];
            return itemDateString >= startDateString && itemDateString <= endDateString;
        });

        const summedCounts = filteredData.reduce(
            (acc, curr) => {
                acc.totalMaleCount += curr.maleCount;
                acc.totalFemaleCount += curr.femaleCount;
                return acc;
            },
            { totalMaleCount: 0, totalFemaleCount: 0 }
        );

        return summedCounts;
    };

    useEffect(() => {
        const updateSummedCounts = () => {
            if (startDate && endDate && isValidDate(startDate) && isValidDate(endDate)) {
                const dateRange = generateDateRange(startDate, endDate);
                setSelectedDates(dateRange);

                const counts = calculateSummedCountsForDateRange(startDate, endDate);
                console.log('Generated date range:', dateRange);
                console.log('Calculated summed counts:', counts);
                setSummedCounts(counts);
            }
        };

        updateSummedCounts();
    }, [startDate, endDate, data]);

    const handleDropdownToggle = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleClickOutside = (event) => {
        if (!event.target.matches(`.${styles.dropbtn}`) && !event.target.matches(`.${styles.dropbtnImg}`)) {
            setIsDropdownOpen(false);
        }
    };

    const handleDatePickerClickOutside = (event) => {
        if (datePickerRef.current && !datePickerRef.current.contains(event.target) && !event.target.matches('[name="daterange"]')) {
            setIsDatePickerOpen(false);
        }
    };

    useEffect(() => {
        window.addEventListener('click', handleClickOutside);
        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        window.addEventListener('click', handleDatePickerClickOutside);
        return () => {
            window.removeEventListener('click', handleDatePickerClickOutside);
        };
    }, [isDatePickerOpen]);

    const handleDateChange = (dates) => {
        const [start, end] = dates;
        if (!isValidDate(start) || (end && !isValidDate(end))) return;

        setStartDate(start);
        setEndDate(end);

        if (start && end) {
            const dateRange = generateDateRange(start, end);
            setSelectedDates(dateRange);

            const counts = calculateSummedCountsForDateRange(start, end);
            console.log('Date range after change:', dateRange);
            console.log('Counts after date change:', counts);
            setSummedCounts(counts);
        }
    };

    console.log(`userEmail: ${userEmail}`);

    return (
        <div className={styles.screen}>
            <div className={styles.sidebar}>
                <img className={styles.sidebarImg} src="/pic/mangomango.jpg" alt="MangoMango" />
                <p className={styles.sidebarP}>mango mango</p>
                <ul>
                    <li><a href={`/${query.keyword}/visualPage`} className={styles.sidebarA}><b>Dashboard</b></a></li>
                    <li><a href={`/${query.keyword}/hashtagPage`} className={styles.sidebarA}>Hashtag Analytics</a></li>
                </ul>
                <a href="/searchPage" className={styles.backToSearch}><img src="/pic/back_to_search.png" alt="backToSearch" /></a>
            </div>
            <div className={styles.dash}>
                <div className={styles.header}>
                    <p className={styles.Dashboard}>Dashboard</p>
                    <div className={styles.dropdown}>
                        <button onClick={handleDropdownToggle} className={styles.dropbtn}>
                            <img src="https://icons.veryicon.com/png/o/internet--web/prejudice/user-128.png" alt="Dropdown" className={styles.dropbtnImg} />
                        </button>
                        <div id="myDropdown" className={`${styles.dropdownContent} ${isDropdownOpen ? styles.show : ''}`}>
                            <div className={styles.accountProfile}>
                                <img src="https://icons.veryicon.com/png/o/internet--web/prejudice/user-128.png" alt="User" className={styles.profileImg} />
                                <div>
                                    <p id="userProfile">{userEmail}</p>
                                </div>
                            </div>
                            <a href="#">Manage Account</a>
                            <a href="#">Notification</a>
                            <a href="/" className={styles.Logout}>Logout</a>
                        </div>
                    </div>
                </div>
                <div className={styles.runName}>
                    <h1 className={styles.runNameFont}>{runName}</h1>
                    <div className={styles.DatePicker}>
                        <input
                            type="text"
                            name="daterange"
                            value={`${startDate ? startDate.toLocaleDateString('en-GB') : ''} - ${endDate ? endDate.toLocaleDateString('en-GB') : ''}`}
                            readOnly
                            onClick={() => setIsDatePickerOpen(true)}
                            className={styles.dateInput}
                        />
                        {isDatePickerOpen && (
                            <div ref={datePickerRef} className={styles.datePickerWrapper}>
                                <DatePicker
                                    selected={startDate}
                                    onChange={handleDateChange}
                                    startDate={startDate}
                                    endDate={endDate}
                                    selectsRange
                                    inline
                                    dateFormat="yyyy/MM/dd"
                                    isClearable
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div className={styles.boardRow}>
                    <div className={styles.gridContainerBoard1}>
                        <div className={styles.graph1}>
                            <p className={styles.Proportion}>Proportion of Gender</p>
                            <PieChart totalMale={summedCounts.totalMaleCount} totalFemale={summedCounts.totalFemaleCount} />
                        </div>
                        <div className={styles.boardColumn}>
                            <div className={styles.graphGender}>
                                <p className={styles.gender}>Male</p>
                                <div className={styles.noGender}>
                                    <img className={styles.noGenderImg} src="../pic/ion_man.png" alt="male" />
                                    <h3 className={styles.showGender}>{new Intl.NumberFormat().format(summedCounts.totalMaleCount)}</h3>
                                </div>
                            </div>
                            <div className={styles.graphGender}>
                                <p className={styles.gender}>Female</p>
                                <div className={styles.noGender}>
                                    <img className={styles.noGenderImg} src="../pic/ion_woman.png" alt="female" />
                                    <h3 className={styles.showGender}>{new Intl.NumberFormat().format(summedCounts.totalFemaleCount)}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.gridContainerBoard2}>
                        <div className={styles.row}>
                            <div className={styles.graphHistogram}>
                                <p className={styles.gender}>Peak Period</p>
                                <Histogram Data={data} dates={selectedDates} />
                            </div>
                            <div className={styles.graphHistogram}>
                                <p className={styles.gender}>Peak period of each gender</p>
                                <HistogramGender Data={data} dates={selectedDates} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VisualPage;
