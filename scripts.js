chrome.tabs.query({active: true, lastFocusedWindow: true}, async function(tabs) {

   const url = tabs[0].url;
   let checkUrl = url.split('/');
   if(checkUrl[2]!='www.youtube.com'){
     document.getElementById('data').innerHTML = 'Invalid Page'
   }else{
     const res =  await axios.post('http://localhost:3000/',{url});
     document.getElementById('data').innerHTML = res.data;
   }

});

