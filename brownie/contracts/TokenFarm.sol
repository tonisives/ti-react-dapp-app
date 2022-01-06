/**
 stake tokens
 unstake tokens
 issue token rewards
 add more tokens to be allowed to be staked
 getEthValue - value of tokens in ether
 */
// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/access/ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract TokenFarm is Ownable {
    address[] public allowedTokens;
    // we cant loop through a mapping, so we use addresses array
    address[] public stakers;
    // tokenaddress > staker address > amount
    mapping(address => mapping(address => uint256)) public stakingBalance;
    mapping(address => uint256) public uniqueTokensStaked;
    mapping(address => address) public tokenPriceFeedMapping;

    IERC20 public dappToken;

    constructor(address _dappTokenAddress) {
        dappToken = IERC20(_dappTokenAddress);
    }

    function stakeTokens(uint256 _amount, address _token) public {
        // what tokens can they stake
        require(_amount > 0, "Amount must be more than 0");
        require(
            tokenIsAllowed(_token),
            "This token is not allowed to be staked"
        );
        // how much can they stake

        /**
        Our contract doesnt own the tokens and we call transferFrom. The owner of transferFrom wallet needs to approve the tokens first.
         */
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        bool addedUniqueToken = updateUniqueTokensStaked(msg.sender, _token);

        stakingBalance[_token][msg.sender] =
            stakingBalance[_token][msg.sender] +
            _amount;

        if (addedUniqueToken && uniqueTokensStaked[msg.sender] == 1) {
            // this was the f irst unique token staked for the user
            stakers.push(msg.sender);
        }
    }

    function unstakeTokens(address _token) public {
        uint256 balance = stakingBalance[_token][msg.sender];
        require(balance > 0, "You have no tokens to unstake");
        IERC20(_token).transfer(msg.sender, balance);
        // TODO: vulnerable to reentrancy attacks
        stakingBalance[_token][msg.sender] = 0;
        uniqueTokensStaked[msg.sender] = uniqueTokensStaked[msg.sender] - 1;
        // TODO: could also update stakers array, to remove the user if they no longer have anything staked. But it's not a problem since in issueTokens we check if the user has any tokens staked
    }

    function updateUniqueTokensStaked(address _user, address _token)
        internal
        returns (bool)
    {
        if (stakingBalance[_token][_user] <= 0) {
            uniqueTokensStaked[_user] = uniqueTokensStaked[_user] + 1;
            return true;
        }
        return false;
    }

    function setPriceFeedContract(address _token, address _priceFeed)
        public
        onlyOwner
    {
        tokenPriceFeedMapping[_token] = _priceFeed;
    }

    /**
        Issue DappToken rewards. For each $ staked by the user, we issue 1 DappToken.
     */
    function issueTokens() public onlyOwner {
        // issue tokens to all stakers
        for (
            uint256 stakersIndex = 0;
            stakersIndex < stakers.length;
            stakersIndex++
        ) {
            address recipient = stakers[stakersIndex];
            uint256 userTotalValue = getUserTotalValue(recipient);
            // send them a token reward based on their total value locked
            dappToken.transfer(recipient, userTotalValue);
        }
    }

    function getUserTotalValue(address recipient)
        public
        view
        returns (uint256)
    {
        // it is more gas efficient for the users to claim the airdrops instead of contract issuing tokens.
        // it gas inefficient looping and checking through all these adresses.
        uint256 totalValue = 0;
        require(
            uniqueTokensStaked[recipient] > 0,
            "User has no tokens to staked"
        );
        for (
            uint256 tokenIndex = 0;
            tokenIndex < allowedTokens.length;
            tokenIndex++
        ) {
            address token = allowedTokens[tokenIndex];
            totalValue =
                totalValue +
                getUserSingleTokenValue(recipient, allowedTokens[tokenIndex]);
        }

        return totalValue;
    }

    /**
     Amount of tokens user has staked in $
     */
    function getUserSingleTokenValue(address _user, address _token)
        public
        view
        returns (uint256)
    {
        // return $ value of the token
        if (uniqueTokensStaked[_user] <= 0) {
            return 0;
        }
        uint256 _stakingBalance = stakingBalance[_token][_user];
        (uint256 price, uint256 decimals) = getTokenValue(_token);
        // price feed is ETH/USD -> 200 (maybe 8 decimals = 200*10**8)
        // stakingbalance is with 18 decimals (5*10**18)
        return (_stakingBalance * price) / 10**decimals;
    }

    /**
    returns price, decimals
    */
    function getTokenValue(address _token)
        public
        view
        returns (uint256, uint256)
    {
        // priceFeedAddress
        address priceFeedAddress = tokenPriceFeedMapping[_token];
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            priceFeedAddress
        );
        (, int256 price, , , ) = priceFeed.latestRoundData();
        uint256 decimals = priceFeed.decimals();
        return (uint256(price), uint256(decimals));
    }

    function addAllowedToken(address _token) public onlyOwner {
        allowedTokens.push(_token);
    }

    function tokenIsAllowed(address _token) public returns (bool) {
        // what tokens can they stake.
        for (
            uint256 allowedTokensIndex = 0;
            allowedTokensIndex < allowedTokens.length;
            allowedTokensIndex++
        ) {
            if (allowedTokens[allowedTokensIndex] == _token) {
                return true;
            }
        }

        return false;
    }
}
