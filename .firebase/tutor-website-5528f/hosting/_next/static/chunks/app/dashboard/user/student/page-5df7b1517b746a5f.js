(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[141],{82:function(e,s,a){Promise.resolve().then(a.bind(a,8633))},8633:function(e,s,a){"use strict";a.r(s),a.d(s,{default:function(){return c}});var n=a(7437);a(4353),a(8858);var t=a(2265),i=a(4693),l=a(195),r=a(2894);function c(){var e,s;let{user:a,loading:c,teacherList:d,fetchTeachers:o,selectedTeacher:u,setSelectedTeacher:h}=(0,i.a)(),[x,g]=(0,t.useState)(!0),[f,m]=(0,t.useState)(""),v=e=>h(e.target.value);return((0,t.useEffect)(()=>{let e=async()=>{try{if(!(null==a?void 0:a.uid)){console.log("No user ID yet, setting isLoading false"),g(!1);return}console.log("Fetching data for user:",a.uid)}catch(e){m("Error fetching data: ".concat(e.message))}finally{g(!1)}};c||e()},[a,c]),(0,t.useEffect)(()=>{o()},[]),c||x)?(console.log("Rendering loading state - userLoading:",c,"isLoading:",x),(0,n.jsx)("div",{className:"flex items-center justify-center min-h-screen",children:(0,n.jsx)("div",{className:"text-lg",children:"Loading..."})})):a?(0,n.jsxs)("div",{children:[f&&(0,n.jsx)(r.Z,{message:f}),(0,n.jsxs)("h2",{children:["Hi, ",a.nickname]}),(0,n.jsxs)("h1",{children:[" ",u&&d[u]?"".concat(d[u].nickname,"'s rate is ").concat(d[u].pricing," dollars per hour"):"Select a teacher"]}),(0,n.jsxs)("h1",{children:["Your balance is ",a.balance," dollars"]}),(0,n.jsx)(()=>(0,n.jsxs)("header",{className:"flex flex-none items-center justify-between border-b border-gray-200 px-6 py-4",children:[(0,n.jsx)("h1",{className:"text-base font-semibold leading-6 text-gray-900",children:(0,n.jsxs)("time",{dateTime:"2022-01",children:[new Date().toLocaleString("default",{month:"long"})," ",new Date().getFullYear()]})}),(0,n.jsx)("div",{children:(0,n.jsxs)("select",{onChange:v,value:u,className:"rounded-md border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50",children:[(0,n.jsx)("option",{value:"",children:"Select a Teacher"}),d&&Object.entries(d).map(e=>{let[s,a]=e;return(0,n.jsx)("option",{value:s,children:a.nickname},s)})]})})]}),{}),(0,n.jsxs)("div",{className:"flex h-full flex-col",children:[(0,n.jsx)(l.Z,{availability:null===(e=d[u])||void 0===e?void 0:e.availability,userType:"student"}),(0,n.jsxs)("div",{className:"text-sm text-gray-500 mt-2",children:["Debug - Selected Teacher: ",u,(0,n.jsx)("br",{}),"Debug - Availability: ",JSON.stringify(null===(s=d[u])||void 0===s?void 0:s.availability)]})]})]}):(0,n.jsx)("div",{className:"flex items-center justify-center min-h-screen",children:(0,n.jsx)("div",{className:"text-lg",children:"Please sign in to access this page"})})}}},function(e){e.O(0,[301,83,649,195,971,117,744],function(){return e(e.s=82)}),_N_E=e.O()}]);