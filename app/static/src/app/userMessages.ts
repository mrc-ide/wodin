import settings from "./settings";

export default {
    code: {
        isValid: "Code is valid",
        isNotValid: "Code is not valid"
    },
    errors: {
        wodinRunError: "An error occurred while running the model",
        wodinSensitivityError: "An error occurred while running sensitivity"
    },
    fitData: {
        errorLoadingData: "An error occurred when loading data",
        errorReadingFile: "An error occurred when reading data file",
        tooFewRows: `File must contain at least ${settings.minFitDataRows} data rows.`,
        tooFewColumns: `File must contain at least ${settings.minFitDataColumns} columns.`,
        nonNumericValues: "Data contains non-numeric values",
        noTimeVariables: "Data contains no suitable time variable. A time variable must strictly increase per row.",
        linkPrerequisites: {
            prefix: "Please complete the following in order to select links:",
            data: "Upload valid data",
            model: "Compile model"
        },
        columnToFitPrerequisites: "Please link at least one column in order to set target to fit."
    },
    run: {
        compileRequired: "Model code has been updated. Compile code and Run Model to view updated graph.",
        runRequired: "Model code has been recompiled or options have been updated. Run Model to view updated graph.",
        notRunYet: "Model has not been run."
    },
    modelFit: {
        cancelled: "Model fit was cancelled before converging",
        notFittedYet: "Model has not been fitted.",
        selectParamToVary: "Please select at least one parameter to vary during model fit.",
        compileRequired: "Model code has been updated. Compile code and Fit Model for updated best fit.",
        fitRequired: "Model code has been recompiled, or options or data have been updated. "
            + "Fit Model for updated best fit.",
        fitRequirements: {
            prefix: "Cannot fit model. Please",
            unknown: "contact the administrator, as this is unexpected",
            needsModel: "compile a model (Code tab)",
            needsData: "upload a data set (Data tab)",
            needsTimeVariable: "select a time variable for the data (Data tab)", // only if !needsModel though!
            needsTarget: "select a target to fit (Options tab)",
            needsParamsToVary: "select at least one parameter to vary (Options tab)"
        }
    },
    sensitivity: {
        compileRequiredForOptions: "Please compile a valid model in order to set sensitivity options.",
        compileRequiredForUpdate: "Model code has been updated. "
            + "Compile code and Run Sensitivity to view updated graph.",
        runRequiredForUpdate: "Model code has been recompiled or options have been updated. "
            + "Run Sensitivity to view updated graph.",
        invalidSettings: "Invalid settings",
        notRunYet: "Sensitivity has not been run."
    }
};
