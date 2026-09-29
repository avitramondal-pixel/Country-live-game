app.get("/api/state", (req,res) => {

  const result = {};

  for(const country of Object.keys(countries)){

    const item = state[country] || {
      score:0,
      latestCommenter:""
    };

    const meta = info[country] || ["🌍",country];

    result[country] = {

      key:country,

      name:meta[1],

      flag:meta[0],

      score:item.score || 0,

      latestCommenter:
        item.latestCommenter || ""

    };

  }

  const activeCountries =
    Object.values(result)
      .filter(x => x.score > 0)
      .length;

  const totalComments =
    Object.values(state)
      .reduce(
        (sum,x)=>sum+(x.commentCount || 0),
        0
      );

  const totalSuperChats =
    Object.values(state)
      .reduce(
        (sum,x)=>sum+(x.superChats || 0),
        0
      );

  res.json({

    countries:result,

    activeCountries,

    totalComments,

    totalSuperChats

  });

});
