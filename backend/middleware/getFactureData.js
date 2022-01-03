//---- main important data extractor middleware : From facture
/*******************************************************
 * this function takes the result of OCR Space in controller and map it to search for
 * companyName, description,Matricule Fiscale, RIB, numero de facture, date, brut, TVA et net_A_payer
 * then returns the relevant data to the files controller to give it back to the user
 * ****************************************************/
const getFactureData = async (Result) => {
  try {
    if (Result) {
      const companyName = Result.Lines[0].LineText;
      let RIB = await Result.Lines.map((line) => {
        if (line.LineText.startsWith("RIB"))
          return line.LineText.replace(/[^\d]/g, "");
      });
      let MF = await Result.Lines.map((line) => {
        if (line.LineText.startsWith("MF"))
          return line.LineText.replace("MF :", "");
      });
      let numFacture = await Promise.all(
        Result.Lines.map(async (line) => {
          let text = line.LineText.toUpperCase();
          if (text.includes("FACTURE") && text.length <= 20) {
            let DimensionTop = line.Words[0].Top;
            let DimensionLeft = line.Words[0].Left;
            let res = await Promise.all(
              Result.Lines.map(async (L) => {
                let wordsArray = await L.Words.map((l) => {
                  if (
                    DimensionTop - 10 <= l.Top &&
                    l.Top < DimensionTop + 10 &&
                    DimensionLeft < l.Left &&
                    l.Left <= DimensionLeft + 300
                  )
                    return l.WordText;
                });
                wordsArray = wordsArray.filter((element) => {
                  return element !== undefined;
                });
                if (wordsArray.length !== 0) return wordsArray;
              })
            );
            res = res.filter((element) => {
              return element !== undefined;
            });
            if (res[0]) res = res[0].toString();
            return res;
          }
        })
      );
      let date = await Result.Lines.map((line) => {
        let text = line.LineText.toUpperCase();
        if (
          /(^\d{1,4}[\.|\\/|-]\d{1,2}[\.|\\/|-]\d{1,4})(\s*(?:0?[1-9]:[0-5]|1(?=[012])\d:[0-5])\d\s*[ap]m)?$/.test(
            text
          )
        ) {
          text = text.replace("DATE", "");
          return text;
        }
      });
      let designations = await Promise.all(Result.Lines.map( async(line) => {
        const text =line.LineText.toUpperCase();
        if (text.startsWith("DESIGNATION")){
          const DimensionTop = line.Words[0].Top;
          const DimensionLeft = line.Words[0].Left;
          let RES = await Result.Lines.map ((L) => {
            if (DimensionTop + 300 > L.Words[0].Top &&
               L.Words[0].Top > DimensionTop + 10 &&
               DimensionLeft - 110 <L.Words[0].Left &&
               L.Words[0].Left < DimensionLeft + 110){
                 return L.LineText;
               }
          });
          RES = RES.filter((element) => {
            return element !== undefined;
          });
        return RES;}
      }));
      let brut = await Promise.all(
        Result.Lines.map(async (line, next) => {
          const text = line.LineText.toUpperCase();
          if (
            text.startsWith("BRUT" || "TOTAL H.T" || "TOTAL HTVA" || "TOTAL HT")
          ) {
            let nextLine = Result.Lines[next + 1].LineText;
            if (/^\d+\.\d/.test(nextLine) || /^\d+\,\d/.test(nextLine)) {
              nextLine = nextLine.replace(/[^0-9.,]/g, "");
              nextLine = nextLine.replace(",", ".");
              return nextLine;
            } else {
              try {
                let DimensionTop = line.Words[0].Top;
                let DimensionLeft = line.Words[0].Left;
                let counter = 2;
                let stop = true;
                do {
                  if (Result.Lines[next + counter]) {
                    var RES = await Result.Lines[next + counter].Words.map(
                      (L) => {
                        if (
                          DimensionTop - 10 <= L.Top &&
                          L.Top < DimensionTop + 10 &&
                          DimensionLeft + 50 <= L.Left &&
                          L.Left <= DimensionLeft + 300
                        ) {
                          let value = L.WordText;
                          value = value.replace(/[^0-9.,]/g, "");
                          value = value.replace(",", ".");
                          stop = !stop;
                          return value;
                        }
                        counter = counter + 1;
                      }
                    );
                  }
                } while (stop && Result.Lines[next + counter]);
                return RES;
              } catch (err) {
                console.log("you have an error : " + err);
                return err;
              }
            }
          }
        })
      );
      brut = brut.filter((element) => {
        return element !== undefined;
      });
      brut = brut.toString();
      let TVA = parseFloat(brut) * 0.19;
      let net_A_Payer = parseFloat(brut) + TVA + 0.6;
      TVA = TVA.toFixed(3);
      net_A_Payer = net_A_Payer.toFixed(3);
      RIB = RIB.filter((element) => {
        return element !== undefined;
      });
      MF = MF.filter((element) => {
        return element !== undefined;
      });
      numFacture = numFacture.filter((element) => {
        return element !== undefined;
      });
      numFacture = numFacture.toString();
      numFacture = numFacture.replace("NO,", "");
      date = date.filter((element) => {
        return element !== undefined;
      });
      designations = designations.filter((element) => {
        return element !== undefined;
      });

      let relevantData = {
        companyName,
        designations,
        MF,
        RIB,
        numFacture,
        date,
        brut,
        TVA,
        net_A_Payer,
      };
      console.log("relevant data" + relevantData);
      return relevantData;
    }
  } catch (err) {
    return err;
  }
};
module.exports = getFactureData;
