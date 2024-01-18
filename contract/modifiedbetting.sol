// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CustomBettingPlatform {
    address public owner;
    uint public minimumBet;
    uint public minUsersForResult; // Minimum users needed for result declaration
    uint public usersPlacedBets; // Number of users who have placed bets
    uint public resultTimestamp; // Timestamp for the next result declaration

    enum BetStatus { Open, Closed, Settled }

    struct Option {
        string description;
        uint odds; // e.g., 2 for 2:1 odds
    }

     struct BetPlacedInfo {
        address user;
        uint optionId;
        uint amount;
    }

    struct Bet {
        address creator;
        string eventDescription;
        uint totalAmount;
        BetStatus status;
        uint[] optionIds; // Store option IDs for this bet
    }

    Option[] public options; // Storage array for options
    Bet[] public bets;

    mapping(uint => BetPlacedInfo[]) public betsPlacedInfo;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    modifier canDeclareResult() {
        require(block.timestamp >= resultTimestamp, "Result cannot be declared yet");
        _;
    }

    event BetPlaced(uint betId, address indexed bettor, uint optionId, uint amount);

    event BetCreated(uint betId, address indexed creator, string eventDescription);

    event ResultDeclared(uint betId, uint winningOptionId);

    constructor(uint _minimumBet, uint _minUsersForResult) {
        owner = msg.sender;
        minimumBet = _minimumBet;
        minUsersForResult = _minUsersForResult;
        resultTimestamp = block.timestamp + calculateResultDelay();
    }

    function calculateResultDelay() public view returns (uint) {
        uint baseDelay = 1 hours; // You can adjust the base delay as needed
        uint additionalDelay = (usersPlacedBets < minUsersForResult) ? 1 days : 0;
        return baseDelay + additionalDelay;
    }

    function createBet(string memory _eventDescription, Option[] memory _betOptions) public payable {
        require(msg.value >= minimumBet, "Insufficient bet amount");

        uint[] memory optionIds = new uint[](_betOptions.length);
        for (uint i = 0; i < _betOptions.length; i++) {
            uint optionId = options.length;
            options.push(Option(_betOptions[i].description, _betOptions[i].odds));
            optionIds[i] = optionId;
        }

        Bet memory newBet = Bet({
            creator: msg.sender,
            eventDescription: _eventDescription,
            totalAmount: msg.value,
            status: BetStatus.Open,
            optionIds: optionIds
        });

        bets.push(newBet);

        emit BetCreated(bets.length - 1, msg.sender, _eventDescription);
    }

    function placeBet(uint _betId, uint _optionId) public payable {
        require(_betId < bets.length, "Invalid bet ID");
        Bet storage bet = bets[_betId];
        require(bet.status == BetStatus.Open, "Betting for this event is closed");
        require(_optionId < bet.optionIds.length, "Invalid option ID");
        require(msg.value >= minimumBet, "Insufficient bet amount");

        uint optionBetAmount = msg.value;
        bet.totalAmount += optionBetAmount;

        emit BetPlaced(_betId, msg.sender, _optionId, optionBetAmount);

        // Increment the number of users who have placed bets
        usersPlacedBets += 1;

        // Automatically close and declare result if minimum users are reached
        if (usersPlacedBets >= minUsersForResult) {
            closeAndDeclareResult(_betId);
        }
    }

    function closeAndDeclareResult(uint _betId) internal {
        Bet storage bet = bets[_betId];
        require(bet.status == BetStatus.Open, "Betting for this event is closed");

        bet.status = BetStatus.Closed;
        resultTimestamp = block.timestamp + calculateResultDelay();

        // Additional logic for result declaration can be added here
        // For simplicity, generate a pseudo-random number based on block hash
        uint seed = uint(blockhash(block.number - 1));
        uint winningOption = seed % bet.optionIds.length;

        emit ResultDeclared(_betId, winningOption);
    }

    function declareResult(uint _betId) public onlyOwner canDeclareResult {
        require(_betId < bets.length, "Invalid bet ID");
        Bet storage bet = bets[_betId];
        require(bet.status == BetStatus.Closed, "Bet is not closed");

        // Additional logic for result declaration can be added here
        // For simplicity, generate a pseudo-random number based on block hash
        uint seed = uint(blockhash(block.number - 1));
        uint winningOption = seed % bet.optionIds.length;

        emit ResultDeclared(_betId, winningOption);
        resultTimestamp = block.timestamp + calculateResultDelay();
    }

     function getBetPlacedInfo(uint _betId) public view returns (BetPlacedInfo[] memory) {
        require(_betId < bets.length, "Invalid bet ID");
        return betsPlacedInfo[_betId];
    }

}
