import settings from "./settings";

export default {
    code: {
        isValid: "Code is valid",
        isNotValid: "Code is not valid"
    },
    fitData: {
        errorLoadingData: "An error occurred when loading data",
        errorReadingFile: "An error occurred when reading data file",
        tooFewRows: `File must contain at least ${settings.minFitDataRows} data rows.`,
        tooFewColumns: `File must contain at least ${settings.minFitDataColumns} columns`,
        nonNumericValues: "Data contains non-numeric values",
        noTimeVariables: "Data contains no suitable time variable. A time variable must strictly increase per row.",
        linkPrerequisites: "Please upload data and compile model in order to select links."
    },
    run: {
        compileRequired: "Model code has been updated. Compile code and Run Model to view updated graph.",
        runRequired: "Model code has been recompiled or options have been updated. Run Model to view updated graph."
    }
};
