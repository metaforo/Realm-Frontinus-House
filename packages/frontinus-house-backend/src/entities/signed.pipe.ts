import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { SignedEntity } from './signed';
import { ethers } from 'ethers';
import config from '../config/configuration';
import { SignatureState } from '../types/signature';
import {
  verifyContractSignature,
  verifyPersonalMessageSignature,
  verifyTypedDataSignature,
} from '../utils';

@Injectable()
export class SignedPayloadValidationPipe implements PipeTransform {
  private readonly _provider = new ethers.providers.JsonRpcProvider(
    config().Web3RpcUrl,
  );

  /**
   * Verifies a signed data payload has a valid EOA or EIP-1271 signature for `value.address`
   */
  async transform(value: SignedEntity) {
    if (config().enableDebugMode) {
      return {
        ...value,
        signatureState: SignatureState.VALIDATED,
      };
    }

    let message;
    try {
      message = Buffer.from(value.signedData.message, 'base64').toString();
    } catch (e) {
      throw new BadRequestException('Failed to valid signature');
    }

    let isValid, sigErr;
    if (value.messageTypes) {
      const { isValidAccountSig, accountSigError } = verifyTypedDataSignature(
        message,
        value,
      );
      isValid = isValidAccountSig;
      sigErr = accountSigError;
    } else {
      const { isValidAccountSig, accountSigError } =
        verifyPersonalMessageSignature(message, value);
      isValid = isValidAccountSig;
      sigErr = accountSigError;
    }

    if (isValid) {
      return {
        ...value,
        signatureState: SignatureState.VALIDATED,
      };
    }

    // If the signer is not a contract, then we have an invalid EOA signature
    const code = await this._provider.getCode(value.address);
    if (code === '0x') {
      throw new BadRequestException('Failed to valid signature');
    }

    // prettier-ignore
    const { isValidContractSig } = await verifyContractSignature(message, value, this._provider);
    if (isValidContractSig) {
      return {
        ...value,
        signatureState: SignatureState.VALIDATED,
      };
    }
    // If the contract signature is not valid, mark it as pending validation
    return {
      ...value,
      signatureState: SignatureState.PENDING_VALIDATION,
    };
  }
}
