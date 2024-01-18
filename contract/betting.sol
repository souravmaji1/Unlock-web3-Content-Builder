// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CustomBettingPlatform {
    address public owner;
    uint public minimumBet;

    enum BetStatus { Open, Closed, Settled }

    struct Option {
        string description;
        uint odds; // e.g., 2 for 2:1 odds
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

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    event BetPlaced(uint betId, address indexed bettor, uint optionId, uint amount);

    event BetCreated(uint betId, address indexed creator, string eventDescription);

    function createBet(string memory _eventDescription, Option[] memory _betOptions) public payable {
       

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

        uint optionBetAmount = msg.value;
        bet.totalAmount += optionBetAmount;

        emit BetPlaced(_betId, msg.sender, _optionId, optionBetAmount);
    }

    function closeBet(uint _betId) public onlyOwner {
        require(_betId < bets.length, "Invalid bet ID");
        Bet storage bet = bets[_betId];
        require(bet.status == BetStatus.Open, "Betting for this event is closed");

        bet.status = BetStatus.Closed;
    }

    function settleBet(uint _betId, uint _winningOptionId) public {
        require(_betId < bets.length, "Invalid bet ID");
        Bet storage bet = bets[_betId];
        require(bet.status == BetStatus.Closed, "Bet is not closed");
        require(_winningOptionId < bet.optionIds.length, "Invalid winning option ID");

        // Implement the logic to distribute prizes based on the winning option
        // You can refer to previous responses for an example of prize distribution.

        bet.status = BetStatus.Settled;
    }

        function getBetDetails(uint _betId) public view returns (Bet memory) {
        require(_betId < bets.length, "Invalid bet ID");
        Bet memory bet = bets[_betId];
        return bet;
    }

    function getBetOptions(uint _betId) public view returns (Option[] memory) {
        require(_betId < bets.length, "Invalid bet ID");
        Bet storage bet = bets[_betId];
        Option[] memory optionsArray = new Option[](bet.optionIds.length);
        for (uint i = 0; i < bet.optionIds.length; i++) {
            optionsArray[i] = options[bet.optionIds[i]];
        }
        return optionsArray;
    }

    function getAllBets() public view returns (Bet[] memory) {
    return bets;
   }

}