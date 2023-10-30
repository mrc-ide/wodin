import settings from "./settings";

const sensType = (multiSens: boolean) => (multiSens ? "Multi-sensitivity" : "Sensitivity");

export default {
    code: {
        isValid: "Code is valid",
        isNotValid: "Code is not valid",
        isValidating: "Code is validating"
    },
    download: {
        invalidPoints: "Modelled points must be between 1 and 50,001"
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
        noTimeVariables: "Data contains no suitable time variable. A time variable must strictly increase per row,"
            + " with no negative values.",
        linkPrerequisites: {
            prefix: "Please complete the following in order to select links:",
            data: "Upload valid data",
            model: "Compile model"
        },
        columnToFitPrerequisites: "Please link at least one column in order to set target to fit."
    },
    help: {
        resetCode: "Revert to default code - all your changes will be lost"
    },
    model: {
        noVariablesSelected: "No variables are selected.",
        selectAVariable: "Please select at least one variable."
    },
    run: {
        compileRequired: "Model code has been updated. Compile code and Run Model to update.",
        notRunYet: "Model has not been run.",
        updateReasons: {
            prefix: "Plot is out of date:",
            modelChanged: "model code has been recompiled",
            parameterValueChanged: "parameters have been changed",
            endTimeChanged: "end time has changed",
            numberOfReplicatesChanged: "number of replicates has changed",
            unknown: "unknown reasons, contact the administrator, as this is unexpected",
            suffix: "Run model to update",
            advancedSettingsChanged: "advanced settings have been changed"
        }
    },
    modelFit: {
        cancelled: "Model fit was cancelled before converging",
        notFittedYet: "Model has not been fitted.",
        selectParamToVary: "Please select at least one parameter to vary during model fit.",
        compileRequired: "Model code has been updated. Compile code and Fit Model for updated best fit.",
        updateFitReasons: {
            prefix: "Fit is out of date:",
            unknown: "unknown reasons, contact the administrator, as this is unexpected",
            modelChanged: "model has been recompiled",
            dataChanged: "data have been updated",
            linkChanged: "model-data link has changed",
            parameterValueChanged: "parameters have been updated",
            parameterToVaryChanged: "parameters to vary have been updated",
            advancedSettingsChanged: "advanced settings have been changed",
            suffix: "Rerun fit to update"
        },
        fitRequirements: {
            prefix: "Cannot fit model. Please",
            unknown: "contact the administrator, as this is unexpected",
            needsModel: "compile a model (Code tab)",
            needsData: "upload a data set (Data tab)",
            needsTimeVariable: "select a time variable for the data (Data tab)",
            needsLinkedVariables: "link your model and data (Options tab)",
            needsTarget: "select a target to fit (Options tab)",
            needsParamsToVary: "select at least one parameter to vary (Options tab)"
        }
    },
    multiSensitivity: {
        runSummary: (solutionCount: number): string => `${sensType(true)} run produced ${solutionCount} solutions.`,
        updateReasons: {
            prefix: "Status is out of date:"
        }
    },
    sensitivity: {
        compileRequiredForOptions: (multiSens: boolean): string => "Please compile a valid model in order to set "
            + `${sensType(multiSens)} options.`,
        compileRequiredForUpdate: (multiSens: boolean): string => "Model code has been updated. "
            + `Compile code and Run ${sensType(multiSens)} to update.`,
        invalidSettings: "Invalid settings",
        notRunYet: (multiSens: boolean): string => `${sensType(multiSens)} has not been run.`,
        updateReasons: {
            prefix: "Plot is out of date:",
            modelChanged: "model code has been recompiled",
            parameterValueChanged: "parameters have been changed",
            sensitivityOptionsChanged:
                (multiSens: boolean): string => `${sensType(multiSens)} options have been changed`,
            endTimeChanged: "end time has changed",
            numberOfReplicatesChanged: "number of replicates has changed",
            advancedSettingsChanged: "advanced settings have been changed",
            unknown: "unknown reasons, contact the administrator, as this is unexpected",
            suffix: (multiSens: boolean): string => `Run ${sensType(multiSens)} to update`
        }
    },
    sessions: {
        loading: "Loading sessions...",
        noSavedYet: "No saved sessions yet.",
        loadApplication: {
            link: "Load the application",
            suffix: " to create a new session."
        },
        initialise: "Would you like to reload the most recent session or start a new session?"
    }
};
