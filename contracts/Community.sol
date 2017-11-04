pragma solidity ^0.4.13;

contract Community {
    uint256 duration; // should use 15000, roughly 3 days (3*24*60*60/17)
    uint256 public totalContribution;
    uint256 public lockedFunds;
    
    function Community(uint256 votingDuration) {
        duration = votingDuration;
    }
    
    struct member {
        address addr;
        uint256 contribution;
    }
    mapping(address => member) public members;
    
    enum voteState {
        VOTING,
        APPROVED,
        DENIED
    }
    
    struct proposal {
        voteState state;
        
        uint256 budget;
        uint256 deadline;
        
        mapping(address => bool) voters;
        int voteSum;
    }
    proposal[] public proposals;
    
    struct withdrawal {
        voteState state;
        
        uint256 amount;
        address recipient;
        uint256 deadline;
        
        mapping(address => bool) voters;
        int voteSum;
    }
    withdrawal[] public withdrawals;
    
    event LogDeposit(address sender, uint256 amount);
    event LogWithdrawal(address recipient, uint256 indexed withdrawalID, uint256 amount);
    event LogProposalRequest(address sender, uint256 id, uint256 budget);
    event LogWithdrawalRequest(address sender, uint256 id, uint256 proposalID, uint256 amount);
    event LogVoteProposal(address sender, uint256 indexed id, bool isApproved);
    event LogVoteWithdrawal(address sender, uint256 indexed id, bool isApproved);
    
    modifier isProposal(uint256 proposalID) {
        require(proposalID < proposals.length); // no out of boundry
        require(proposals[proposalID].deadline != 0); // proposal exists
        
        _;
    }
    
    modifier isWithdrawal(uint256 id) {
        require(id < withdrawals.length); // no out of boundry
        require(withdrawals[id].recipient != 0); // proposal exists
        
        _;
    }
    
    function availableFunds() constant returns (uint256) {
        assert(lockedFunds <= totalContribution);
        return totalContribution-lockedFunds;
    }
    
    function deposit() payable returns (bool success) {
        require(msg.value > 0); // Must send funds
        
        member storage mem = members[msg.sender];
        mem.addr = msg.sender;
        mem.contribution += msg.value;
        totalContribution += msg.value;
        
        LogDeposit(msg.sender, msg.value);
        return true;
    }
    
    function createProposal(uint256 budget) returns (uint256 propsoalID) {
        require(budget <= availableFunds()); // cannot spend more money than community has
        
        proposal memory prop;
        prop.budget = budget;
        prop.deadline = block.number+duration;
        prop.state = voteState.VOTING;
        
        proposals.push(prop);
        uint256 id = proposals.length-1;
        LogProposalRequest(msg.sender, id, budget);
        return id;
    }
    
    function approveProposal(uint256 proposalID, bool isApproved) isProposal(proposalID) returns (bool success) {
        member storage mem = members[msg.sender];
        require(mem.addr != 0); // voter has to be a member of community
        
        proposal storage prop = proposals[proposalID];
        require(!prop.voters[msg.sender]); // has not voted before
        require(block.number < prop.deadline); // cannot vote after deadline
        require(prop.state == voteState.VOTING);
        
        if (isApproved) {
            prop.voteSum += int(mem.contribution);
        } else {
            prop.voteSum -= int(mem.contribution);
        }
        prop.voters[msg.sender] = true;
        
        LogVoteProposal(msg.sender, proposalID, isApproved);
        return true;
    }
    
    function confirmProposal(uint256 proposalID) isProposal(proposalID) returns (bool success) {
        proposal storage prop = proposals[proposalID];
        require(block.number >= prop.deadline);
        require(prop.state == voteState.VOTING);
        
        if (prop.voteSum > 0) {
            require(prop.budget <= availableFunds()); // cannot spend more money than community has
            prop.state = voteState.APPROVED;
            lockedFunds += prop.budget;
        } else {
            // failed TODO what do we do here?
            prop.state = voteState.DENIED;
        }
        return true;
    }
    
    function withdrawFunds(uint256 proposalID, uint256 amount, address recipient) isProposal(proposalID) returns (uint256 withdrawID) {
        proposal storage prop = proposals[proposalID];
        require(prop.state == voteState.APPROVED);
        require(amount <= prop.budget);
        
        withdrawal memory with;
        with.amount = amount;
        with.recipient = recipient;
        with.deadline = block.number+duration;
        with.state = voteState.VOTING;
        
        withdrawals.push(with);
        uint256 id = withdrawals.length-1;
        LogWithdrawalRequest(msg.sender, id, proposalID, amount);
        return id;
    }
    
    function approveWithdrawal(uint256 withdrawalID, bool isApproved) isWithdrawal(withdrawalID) returns (bool success) {
        member storage mem = members[msg.sender];
        require(mem.addr != 0); // voter has to be a member of community
        
        withdrawal storage with = withdrawals[withdrawalID];
        require(!with.voters[msg.sender]); // has not voted before
        require(block.number < with.deadline); // cannot vote after deadline
        require(with.state == voteState.VOTING);
        
        if (isApproved) {
            with.voteSum += int(mem.contribution);
        } else {
            with.voteSum -= int(mem.contribution);
        }
        with.voters[msg.sender] = true;
        
        LogVoteWithdrawal(msg.sender, withdrawalID, isApproved);
        return true;
    }
    
    function withdraw(uint256 withdrawalID) returns (bool success) {
        withdrawal storage with = withdrawals[withdrawalID];
        require(block.number >= with.deadline);
        require(with.state == voteState.VOTING);
        
        if (with.voteSum > 0) {
            require(with.amount <= availableFunds()); // cannot spend more money than community has
            with.state = voteState.APPROVED;
            lockedFunds -= with.amount;
            totalContribution -= with.amount;
            with.recipient.transfer(with.amount);
            LogWithdrawal(with.recipient, withdrawalID, with.amount);
        } else {
            // failed TODO what do we do here?
            with.state = voteState.DENIED;
        }
        
        return true;
    }

}
