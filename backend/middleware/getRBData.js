const dimensions = async (Result, dataToSearch) => {
 let res = await Result.Lines.map((line) => {
     const text =line.LineText.toUpperCase();
    if ( text.startsWith(dataToSearch)) {
      const DimensionTop = line.Words[0].Top;
      const DimensionLeft = line.Words[0].Left;
      const Top_Left = {"DimensionTop" : DimensionTop, "DimensionLeft" : DimensionLeft};
      return Top_Left;
    }
  });
  res = res.filter((element) => {
      return element !== undefined;
  });
   return res[0];
};
//main important data extractor middleware : from RB
/************************************************************************************
 * this function takes the result of OCR Space in controller and map it to search for
 * dates, labels(references), values ( dates of receipt), debit and credit
 * then returns the relevant data to the files controller to give it back to the user
 *********************************************************************************** */
const getRBData = async (Result) => {
  try {
    if (Result) {
      const dimensionsDate = await dimensions(Result, "DATE");
      let dates = await Promise.all(Result.Lines.map(async (line) => 
      {
        const text = line.LineText;
        if (
          line.Words[0].Top
           > dimensionsDate.DimensionTop &&
          dimensionsDate.DimensionLeft - 15 <
            line.Words[0].Left <
            dimensionsDate.DimensionLeft + 15 &&
          /(^\d{1,4}[\.|\\/|-]\d{1,2}[\.|\\/|-]\d{1,4})(\s*(?:0?[1-9]:[0-5]|1(?=[012])\d:[0-5])\d\s*[ap]m)?$/.test(
            text
          )
        )
         return text;
      }));
      dates = dates.filter((element) => {
          return element !== undefined;
      });
      const dimensionsLabels = await dimensions(Result, "LIBELLÉ");
      console.log(dimensionsLabels);
      let labels = await Promise.all(Result.Lines.map(async (line)=> {
          const text = line.lineText;
          if (
              line.Words[0].Top > dimensionsLabels.DimensionTop > line.Words[0].Top + 320 &&
              line.Words[0].Left + 50 > dimensionsLabels.DimensionLeft > line.Words[0].Left
          ) return text;
      }));
      labels = labels.filter((element)=> {
          return element !== undefined;
      });
      let relevantData = {
          dates,
          labels
      };
      console.log("relevant data" + relevantData);
      return relevantData;
    }
  } catch (err) {
    console.log("you have an error : " + err);
    return err;
  }
};
module.exports = getRBData;
