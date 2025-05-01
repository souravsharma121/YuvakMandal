// src/i18n.js
import i18n from 'i18next';
import {
    initReactI18next
} from 'react-i18next';

// Translation resources
const resources = {
    en: {
        translation: {
            "welcome": {
                "guest": "Welcome, Guest User",
                "user": "Welcome, {{name}}"
            },
            "notificationsDashboard": {
                "recent": "Recent Notifications",
                "noRecent": "No recent notifications",
                "viewAll": "View all notifications"
            },
            "treasurerDashboard": {
                "title": "Treasurer Dashboard",
                "pendingApprovals": "Pending Approvals",
                "viewPending": "View pending approvals"
            },
            "currentStatus": {
                "title": "Current Month Status",
                "status": "Status",
                "amount": "Amount",
                "submit": "Submit",
                "approved": "Approved",
                "pending": "Pending",
                "rejected": "Rejected",
                "notSubmitted": "Not Submitted"
            },
            "guestInfo": {
                "title": "About Our Mandal",
                "description": "Jai Dev Balatika Shegal Yuvak Mandal Burahan is a community organization dedicated to:",
                "points": {
                    "development": "Fostering community development",
                    "activities": "Organizing cultural activities",
                    "youth": "Supporting youth initiatives",
                    "welfare": "Promoting social welfare"
                },
                "learnMore": "Learn how to become a member"
            },
            "by": "by",
            "role": "Role",
            "dashboard": "Dashboard",
            "profile": "Profile",
            "notifications": "Notifications",
            "contributions": "Contributions",
            "admin": "Admin",
            "manageUsers": "Manage Users",
            "treasurer": "Treasurer",
            "approveContributions": "Approve Contributions",
            "addMemberContribution": "Add Member Contribution",
            "create": "Create",
            "newNotification": "New Notification",
            "logout": "Logout",
            "leadership_team": "Our Leadership Team",
            "pradhan": "Pradhan",
            "up_pradhan": "Up Pradhan",
            "secretary": "Secretary",
            "treasurer": "Treasurer",
            "contact_number": "Contact Number",
            "village": "Village",
            "weather": "Weather",
            "weatherForecast": "Weather Forecast",
            "searchLocation": "Search for a location...",
            "search": "Search",
            "loadingWeather": "Loading weather data...",
            "hourlyForecast": "Hourly",
            "dailyForecast": "Daily",
            "monthlyForecast": "Monthly",
            "next24Hours": "Next 24 Hours",
            "next5Days": "5-Day Forecast",
            "monthlyOutlook": "Monthly Outlook",
            "temperatureOutlook": "Temperature Outlook",
            "precipitationOutlook": "Precipitation Outlook",
            "avgHigh": "Avg High",
            "avgLow": "Avg Low",
            "avgHumidity": "Avg Humidity",
            "avgWind": "Avg Wind",
            "highTemp": "High",
            "lowTemp": "Low",
            "feelsLike": "Feels Like",
            "wind": "Wind",
            "humidity": "Humidity",
            "pressure": "Pressure",
            "visibility": "Visibility",
            "high": "High",
            "low": "Low",
            "temperatureTrend": "Temperature Trend",
            "temperatureChartDescription": "Temperature trend chart showing forecasted temperatures over time",
            "weatherDetails": "Weather Details",
            "weatherDataSource": "Weather data provided by OpenWeatherMap API",
            "monthlyForecastDescription": "Monthly forecast based on available 5-day forecast data. This is an estimation and should be used as a general guide only.",
            "sunrise": "Sunrise",
            "sunset": "Sunset",
            "coordinates": "Coordinates"


        }
    },
    hi: {
        translation: {
            "welcome": {
                "guest": "स्वागत है, अतिथि उपयोगकर्ता",
                "user": "स्वागत है, {{name}}"
            },
            "notificationsDashboard": {
                "recent": "हाल की सूचनाएं",
                "noRecent": "कोई हाल की सूचनाएं नहीं हैं",
                "viewAll": "सभी सूचनाएं देखें"
            },
            "treasurerDashboard": {
                "title": "कोषाध्यक्ष डैशबोर्ड",
                "pendingApprovals": "लंबित अनुमोदन",
                "viewPending": "लंबित अनुमोदन देखें"
            },
            "currentStatus": {
                "title": "चालू माह की स्थिति",
                "status": "स्थिति",
                "amount": "राशि",
                "submit": "प्रस्तुत करें",
                "approved": "स्वीकृत",
                "pending": "लंबित",
                "rejected": "अस्वीकृत",
                "notSubmitted": "प्रस्तुत नहीं किया गया"
            },
            "guestInfo": {
                "title": "हमारे मंडल के बारे में",
                "description": "जय देव बालाटिका शैगल युवक मंडल बुरहान एक सामुदायिक संगठन है जो समर्पित है:",
                "points": {
                    "development": "सामुदायिक विकास को बढ़ावा देना",
                    "activities": "सांस्कृतिक गतिविधियों का आयोजन करना",
                    "youth": "युवा पहलों का समर्थन करना",
                    "welfare": "सामाजिक कल्याण को बढ़ावा देना"
                },
                "learnMore": "सदस्य बनने के तरीके जानें"
            },
            "by": "द्वारा",
            "role": "भूमिका",
            "dashboard": "डैशबोर्ड",
            "profile": "प्रोफाइल",
            "notifications": "सूचनाएं",
            "contributions": "योगदान",
            "admin": "व्यवस्थापक",
            "manageUsers": "उपयोगकर्ताओं का प्रबंधन",
            "treasurer": "कोषाध्यक्ष",
            "approveContributions": "योगदान स्वीकृत करें",
            "addMemberContribution": "सदस्य योगदान जोड़ें",
            "create": "बनाएं",
            "newNotification": "नई सूचना",
            "logout": "लॉग आउट",
            "leadership_team": "हमारी नेतृत्व टीम",
            "pradhan": "प्रधान",
            "up_pradhan": "उप प्रधान",
            "secretary": "सचिव",
            "treasurer": "कोषाध्यक्ष",
            "contact_number": "संपर्क नंबर",
            "village": "ग्राम",
            "weather": "मौसम",
            "weatherForecast": "मौसम पूर्वानुमान",
            "searchLocation": "स्थान खोजें...",
            "search": "खोज",
            "loadingWeather": "मौसम डेटा लोड हो रहा है...",
            "hourlyForecast": "प्रति घंटा",
            "dailyForecast": "दैनिक",
            "monthlyForecast": "मासिक",
            "next24Hours": "अगले 24 घंटे",
            "next5Days": "5-दिन का पूर्वानुमान",
            "monthlyOutlook": "मासिक अवलोकन",
            "temperatureOutlook": "तापमान अवलोकन",
            "precipitationOutlook": "वर्षा अवलोकन",
            "avgHigh": "औसत अधिकतम",
            "avgLow": "औसत न्यूनतम",
            "avgHumidity": "औसत आर्द्रता",
            "avgWind": "औसत हवा",
            "highTemp": "अधिकतम",
            "lowTemp": "न्यूनतम",
            "feelsLike": "अनुभव",
            "wind": "हवा",
            "humidity": "आर्द्रता",
            "pressure": "दबाव",
            "visibility": "दृश्यता",
            "high": "अधिकतम",
            "low": "न्यूनतम",
            "temperatureTrend": "तापमान प्रवृत्ति",
            "temperatureChartDescription": "समय के साथ पूर्वानुमानित तापमान दिखाने वाला चार्ट",
            "weatherDetails": "मौसम विवरण",
            "weatherDataSource": "मौसम डेटा OpenWeatherMap API द्वारा प्रदान किया गया है",
            "monthlyForecastDescription": "उपलब्ध 5-दिन के पूर्वानुमान डेटा पर आधारित मासिक पूर्वानुमान। यह एक अनुमान है और केवल सामान्य मार्गदर्शन के लिए उपयोग किया जाना चाहिए।",
            "sunrise": "सूर्योदय",
            "sunset": "सूर्यास्त",
            "coordinates": "निर्देशांक"

        }
    }
};

i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        lng: localStorage.getItem('i18nextLng') || 'en', // default language
        interpolation: {
            escapeValue: false, // react already safes from xss
        }
    });

export default i18n;