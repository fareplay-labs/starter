// @ts-nocheck
const errorDataToSCString = {
  '0x011e83fc': 'EthUsdcPriceExceedsMax',
  '0x04786ad1': 'ERC20InvalidReceiver',
  '0x0a1f4ea1': 'QKLengthMismatch',
  '0x0b7eb12a': 'InvalidSubmitterForFundOwner',
  '0x223c89a4': 'ERC20InvalidApprover',
  '0x2990451c': 'AACostMultiplierExceedsMax',
  '0x2fc50d60': 'ERC20InsufficientAllowance',
  '0x3a3f235f': 'OnlyOwnerOrCoordinator',
  '0x3b800a46': 'ArrayLengthsMismatch',
  '0x4290697b': 'RandomnessOutOfBounds',
  '0x590b7c5c': 'ERC20InsufficientBalance',
  '0x5b168993': 'ERC20InvalidSender',
  '0x6697b232': 'AccessControlBadConfirmation',
  '0x68885df1': 'EvThresholdCannotExceedUnit',
  '0x6eefed20': 'InvalidContract',
  '0x95ca5340': 'MultiplierCannotBeZero',
  '0x9e8d4d01': 'InvalidContractForFundOwner',
  '0xa133bd5c': 'OnlyCoordinatorCanFulfill',
  '0xa467a1b5': 'InvalidVRFWrapperAddress',
  '0xad8991bd': 'PRBMath_MulDiv18_Overflow',
  '0xb1c7e475': 'AverageCallbackGasExceedsMax',
  '0xbcb1abcb': 'RngTimeOut',
  '0xbd0f3dfd': 'InvalidFeeRecipientAddress',
  '0xc7f768db': 'AccessControlUnauthorizedAccount',
  '0xd82e2895': 'InvalidFareAAAddress',
  '0xd92e233d': 'ZeroAddress',
  '0xdeed3d66': 'ERC20InvalidSpender',
  '0xe7021ff0': 'CannotExtraordinaryResolveYet',
  '0xf13c3819': 'InvalidPotentialProfit',
  '0xf200e114': 'InvalidUsdcAddress',
}
// script to get these values =>
// we create the 'errObjectFromArtifact' object by adding all the custom errors from abis of the contracts
// const errObjectFromArtifact = [
//   {
//         "inputs": [],
//         "name": "AACostMultiplierExceedsMax",
//         "type": "error"
//       },
//       {
//         "inputs": [],
//         "name": "AccessControlBadConfirmation",
//         "type": "error"
//       },
//       {
//         "inputs": [
//           {
//             "internalType": "address",
//             "name": "account",
//             "type": "address"
//           },
//           {
//             "internalType": "bytes32",
//             "name": "neededRole",
//             "type": "bytes32"
//           }
//         ],
//         "name": "AccessControlUnauthorizedAccount",
//         "type": "error"
//       },
//       {
//         "inputs": [],
//         "name": "AverageCallbackGasExceedsMax",
//         "type": "error"
//       },
//       {
//         "inputs": [],
//         "name": "CannotExtraordinaryResolveYet",
//         "type": "error"
//       },
//       {
//         "inputs": [],
//         "name": "EthUsdcPriceExceedsMax",
//         "type": "error"
//       },
//       {
//         "inputs": [],
//         "name": "EvThresholdCannotExceedUnit",
//         "type": "error"
//       },
//       {
//         "inputs": [],
//         "name": "InvalidFareAAAddress",
//         "type": "error"
//       },
//       {
//         "inputs": [],
//         "name": "InvalidFeeRecipientAddress",
//         "type": "error"
//       },
//       {
//         "inputs": [],
//         "name": "InvalidPotentialProfit",
//         "type": "error"
//       },
//       {
//         "inputs": [],
//         "name": "InvalidVRFWrapperAddress",
//         "type": "error"
//       },
//       {
//         "inputs": [],
//         "name": "MultiplierCannotBeZero",
//         "type": "error"
//       },
//       {
//         "inputs": [
//           {
//             "internalType": "address",
//             "name": "have",
//             "type": "address"
//           },
//           {
//             "internalType": "address",
//             "name": "want",
//             "type": "address"
//           }
//         ],
//         "name": "OnlyCoordinatorCanFulfill",
//         "type": "error"
//       },
//       {
//         "inputs": [
//           {
//             "internalType": "address",
//             "name": "have",
//             "type": "address"
//           },
//           {
//             "internalType": "address",
//             "name": "owner",
//             "type": "address"
//           },
//           {
//             "internalType": "address",
//             "name": "coordinator",
//             "type": "address"
//           }
//         ],
//         "name": "OnlyOwnerOrCoordinator",
//         "type": "error"
//       },
//       {
//         "inputs": [
//           {
//             "internalType": "uint256",
//             "name": "x",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "y",
//             "type": "uint256"
//           }
//         ],
//         "name": "PRBMath_MulDiv18_Overflow",
//         "type": "error"
//       },
//       {
//         "inputs": [],
//         "name": "QKLengthMismatch",
//         "type": "error"
//       },
//       {
//         "inputs": [],
//         "name": "RandomnessOutOfBounds",
//         "type": "error"
//       },
//       {
//         "inputs": [],
//         "name": "RngTimeOut",
//         "type": "error"
//       },
//       {
//         "inputs": [],
//         "name": "ZeroAddress",
//         "type": "error"
//       },
//       {
//         "inputs": [],
//         "name": "ArrayLengthsMismatch",
//         "type": "error"
//       },
//       {
//         "inputs": [],
//         "name": "InvalidContract",
//         "type": "error"
//       },
//       {
//         "inputs": [],
//         "name": "InvalidContractForFundOwner",
//         "type": "error"
//       },
//       {
//         "inputs": [],
//         "name": "InvalidSubmitterForFundOwner",
//         "type": "error"
//       },
//       {
//         "inputs": [],
//         "name": "InvalidUsdcAddress",
//         "type": "error"
//       },
//       {
//         "inputs": [],
//         "name": "AccessControlBadConfirmation",
//         "type": "error"
//       },
//       {
//         "inputs": [
//           {
//             "internalType": "address",
//             "name": "account",
//             "type": "address"
//           },
//           {
//             "internalType": "bytes32",
//             "name": "neededRole",
//             "type": "bytes32"
//           }
//         ],
//         "name": "AccessControlUnauthorizedAccount",
//         "type": "error"
//       },
//       {
//         "inputs": [],
//         "name": "ArrayLengthsMismatch",
//         "type": "error"
//       },
//       {
//         "inputs": [],
//         "name": "InvalidContract",
//         "type": "error"
//       },
//       {
//         "inputs": [],
//         "name": "InvalidContractForFundOwner",
//         "type": "error"
//       },
//       {
//         "inputs": [],
//         "name": "InvalidSubmitterForFundOwner",
//         "type": "error"
//       },
//       {
//         "inputs": [],
//         "name": "InvalidUsdcAddress",
//         "type": "error"
//       },
//       {
//         "inputs": [
//           {
//             "internalType": "address",
//             "name": "spender",
//             "type": "address"
//           },
//           {
//             "internalType": "uint256",
//             "name": "allowance",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "needed",
//             "type": "uint256"
//           }
//         ],
//         "name": "ERC20InsufficientAllowance",
//         "type": "error"
//       },
//       {
//         "inputs": [
//           {
//             "internalType": "address",
//             "name": "sender",
//             "type": "address"
//           },
//           {
//             "internalType": "uint256",
//             "name": "balance",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "needed",
//             "type": "uint256"
//           }
//         ],
//         "name": "ERC20InsufficientBalance",
//         "type": "error"
//       },
//       {
//         "inputs": [
//           {
//             "internalType": "address",
//             "name": "approver",
//             "type": "address"
//           }
//         ],
//         "name": "ERC20InvalidApprover",
//         "type": "error"
//       },
//       {
//         "inputs": [
//           {
//             "internalType": "address",
//             "name": "receiver",
//             "type": "address"
//           }
//         ],
//         "name": "ERC20InvalidReceiver",
//         "type": "error"
//       },
//       {
//         "inputs": [
//           {
//             "internalType": "address",
//             "name": "sender",
//             "type": "address"
//           }
//         ],
//         "name": "ERC20InvalidSender",
//         "type": "error"
//       },
//       {
//         "inputs": [
//           {
//             "internalType": "address",
//             "name": "spender",
//             "type": "address"
//           }
//         ],
//         "name": "ERC20InvalidSpender",
//         "type": "error"
//       }
//   ]

// const errNames = errObjectFromArtifact.map(eo => eo.name)
// const errNameToHex = {}
// errNames.map(errName => errNameToHex[errName] = ethers.utils.id(`${errName}()`).substring(0, 10))

// const errHexToName = {}
// errNames.map(errName => errHexToName[ethers.utils.id(`${errName}()`).substring(0, 10)] = errName)

const mapErrorDataToSCString = (errorData: string) => {
  return (errorDataToSCString as any)[errorData] || 'UnknownError'
}

const mapSCStringToMeaningfulString = (scString: string) => {
  let meaningfulString =
    Object.values(errorDataToSCString).includes(scString) ? scString : 'UnknownError'
  if (scString === 'InvalidContractTokenOrAmountForBankroll') {
    meaningfulString = 'Minimum entry: 100 PHONEY'
  }
  return meaningfulString
}

export const mapErrorDataToMeaningfullString = (errorData: string) => {
  return mapSCStringToMeaningfulString(mapErrorDataToSCString(errorData))
}

// @TODO: Maybe could use another way to do this like have a var for striungs and use it both while throwing and checking here
const knownCustomErrorMessages = [
  'Try decreasing count. Building Q requires more precision than we support.',
  'EV for a slice is above 0.99, this slice will be discarded.',
  'EV sum is above 0.99, this trial will be discarded.',
]

export const isKnownErrorMessage = (errMessage: string) => {
  return knownCustomErrorMessages.includes(errMessage)
}
