// Page load
chrome.storage.sync.get('savedCollection', function(items) {
    let savedCollection = items.savedCollection;

    if (!savedCollection) {
        savedCollection = {
            "Valorant": {
                "_id": 0,
                "name": "Valorant",
                "api": "https://api.henrikdev.xyz/",
                "parameters": "valorant/v1/mmr/eu/ily/321"
            },
            "Valorant2": {
                "_id": 1,
                "name": "Valorant 2",
                "api": "https://api.kyroskoh.xyz/",
                "parameters": "valorant/v1/mmr/eu/ily/321"
            },
            "Overwatch": {
                "_id": 2,
                "name": "Overwatch",
                "api": "https://ow-api.com/",
                "parameters": "v1/stats/pc/eu/ily-22846/profile"
            }
        };
    }
    
    // save savedCollection to local storage
    chrome.storage.sync.set({'savedCollection': savedCollection}, function() {
        console.log(`'savedCollection' saved with data: ${savedCollection}`);
    });

});