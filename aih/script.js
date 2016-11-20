var users={}
var topics={}

Papa.parse('./usernodeproperties.csv', {
      	download: true,
       	header: true,
       	dynamicTyping: true,
       	complete: function(results) 
       	{
			for (var row=0; row < results.data.length-1; row++)
			{
				var record = results.data[row];

			var user = {
				userid: record.UID,
				com_made: record.CommentsMade,
				posts_made: record.PostsMade,
				com_rec: record.CommentsReceived,
				adj_top: record.AdjTopicPopularity,
				topic_conn: {
					TA: record.TA,
					TB: record.TB,
					TC: record.TC,
					TD: record.TD,
					TE: record.TE	
				}
			}
			users[record.UID] = user
		}
	}
});


Papa.parse('./topicnodeproperties.csv', {
      	download: true,
       	header: true,
       	dynamicTyping: true,
       	complete: function(results) 
       	{
			for (var row=0; row < results.data.length-1; row++)
			{
				var record = results.data[row];

			var topic = {
				topicid: record.TID,
				user_pop: record.UserPopularity,
				rank: record.Rank,
				title: record.TopicTitle,
				keywords: record.Keywords.split(" "),
				user_conn: []
			}
			topic.keywords.pop()
			topics[record.TID] = topic
		}
	}
});

Papa.parse('./usertopicedges.csv', {
      	download: true,
       	header: true,
       	dynamicTyping: true,
       	complete: function(results) 
       	{
			for (var row=0; row < results.data.length-1; row++)
			{
				var record = results.data[row];
				topics[record.TID].user_conn.push(record.UID)		
		}
	}
});

console.log(topics)

console.log(users)