const dimensions = async (Result, dataToSearch) => {
  let res = await Result.Lines.map((line) => {
    const text = line.LineText.toUpperCase();
    if (text.startsWith(dataToSearch)) {
      let Top_Left = {
        DimensionTop: line.Words[0].Top,
        DimensionLeft: line.Words[0].Left,
      };
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
      let dates = await Result.Lines.map((line) => {
        const text = line.LineText;
        if (
          (line.Words[0].Top > dimensionsDate.DimensionTop &&
          dimensionsDate.DimensionLeft - 15 < line.Words[0].Left && 
            line.Words[0].Left < dimensionsDate.DimensionLeft + 15 ) &&
          /(^\d{1,4}[\.|\\/|-]\d{1,2}[\.|\\/|-]\d{1,4})(\s*(?:0?[1-9]:[0-5]|1(?=[012])\d:[0-5])\d\s*[ap]m)?$/.test(
            text
          )
        )
          return text;
      });

      const dimensionsLabels = await dimensions(Result, "LIBELLÉ");
      let labels = await Result.Lines.map((line) => {
        const text =line.LineText;
        if (
          line.Words[0].Top > dimensionsLabels.DimensionTop &&
          line.Words[0].Top < dimensionsLabels.DimensionTop + 320 &&
          line.Words[0].Left < dimensionsLabels.DimensionLeft + 20  &&
          line.Words[0].Left > dimensionsLabels.DimensionLeft - 70
        )
          return text;
          
      });

      const dimensionsValue = await dimensions(Result, "VALEUR");
      let values = await Result.Lines.map((line) => {
        const text = line.LineText;
        if (
          line.Words[0].Top > dimensionsValue.DimensionTop + 10 &&
          dimensionsValue.DimensionLeft - 15 < line.Words[0].Left && 
          line.Words[0].Left < dimensionsValue.DimensionLeft + 15 &&
          /(^\d{1,4}[\.|\\/|-]\d{1,2}[\.|\\/|-]\d{1,4})(\s*(?:0?[1-9]:[0-5]|1(?=[012])\d:[0-5])\d\s*[ap]m)?$/.test(
            text
          )
        )
          return text;
      });

      const dimensionsDebit = await dimensions (Result, "DÉBIT");
      console.log(dimensionsDebit);
      let  debits = await Result.Lines.map((line)=> {
        const text = line.LineText;
        if (
          line.Words[0].Top > dimensionsDebit.DimensionTop &&
          line.Words[0].Top < dimensionsDebit.DimensionTop + 315 &&
          line.Words[0].Left > dimensionsDebit.DimensionLeft &&
          line.Words[0].Left < dimensionsDebit.DimensionLeft + 100
        )
        return text;
      });

      const dimensionsCredit = await dimensions (Result, "CRÉDIT");
      console.log(dimensionsCredit);
      let  credits = await Result.Lines.map((line)=> {
        const text = line.LineText;
        if (
          line.Words[0].Top > dimensionsCredit.DimensionTop &&
          line.Words[0].Top < dimensionsCredit.DimensionTop + 315 &&
          line.Words[0].Left > dimensionsCredit.DimensionLeft &&
          line.Words[0].Left < dimensionsCredit.DimensionLeft + 100
        )
        return text;
      });

      dates = dates.filter((element) => {
        return element !== undefined;
      });
      labels = labels.filter((element) => {
        return element !== undefined;
      });
      values = values.filter((element) => {
        return element !== undefined;
      });
      debits = debits.filter((element) => {
        return element !== undefined;
      });
      credits = credits.filter((element) => {
        return element !==undefined;
      });

      let relevantData = {
        dates,
        labels,
        values,
        debits,
        credits
      };
      console.log(relevantData);
      return relevantData;
    }
  } catch (err) {
    return err;
  }
};
module.exports = getRBData;
