pragma solidity 0.4.13;

contract Community {
    uint256 duration; // shoudl use 15000, roughly 3 days (3*24*60*60/17)
    function Community(uint256 votingDuration) {
        duration = votingDuration;
    }
    
    struct member {
        address addr;
        uint256 contribution;
    }
    mapping(address => member) public members;
    
    enum proposalState {
        VOTING,
        APPROVED,
        DENIED
    }
    
    struct proposal {
        uint256 budget;
        address receiver;
        uint256 deadline;
        
        mapping(address => bool) voters;
        int voteSum;
        
        proposalState state;
    }
    proposal[] public proposals;
    
    uint256 public totalContribution;
    uint256 public lockedFunds;
    
    function availableFunds() constant returns (uint256) {
        assert(lockedFunds <= totalContribution);
        return totalContribution-lockedFunds;
    }

    event LogDeposit(address sender, uint256 amount);
    
    function deposit() payable {
        require(msg.value > 0); // Must send funds
        
        member storage mem = members[msg.sender];
        mem.addr = msg.sender;
        mem.contribution += msg.value;
        totalContribution += msg.value;
        
        LogDeposit(msg.sender, msg.value);
    }
    
    function createProposal(uint256 budget, address receiver) returns (uint256 propsoalID) {
        require(receiver != 0);
        require(budget <= availableFunds()); // cannot spend more money than community has
        
        proposal memory prop;
        prop.budget = budget;
        prop.receiver = receiver;
        prop.deadline = block.number+duration;
        prop.state = proposalState.VOTING;
        
        proposals.push(prop);
        return proposals.length-1;
    }
    
    modifier isProposal(uint256 proposalID) {
        require(proposalID < proposals.length); // no out of boundry
        require(proposals[proposalID].deadline != 0); // proposal exists
        
        _;
    }
    
    function approveProposal(uint256 proposalID, bool isApproved) isProposal(proposalID) returns (bool success) {
        member storage mem = members[msg.sender];
        require(mem.addr != 0); // voter has to be a member of community
        
        proposal storage prop = proposals[proposalID];
        require(!prop.voters[msg.sender]); // has not voted before
        require(block.number < prop.deadline); // cannot vote after deadline
        require(prop.state == proposalState.VOTING);
        
        if (isApproved) {
            prop.voteSum += int(mem.contribution);
        } else {
            prop.voteSum -= int(mem.contribution);
        }
        prop.voters[msg.sender] = true;
        
        return true;
    }
    
    function confirmProposal(uint256 proposalID) isProposal(proposalID) returns (bool success) {
        proposal storage prop = proposals[proposalID];
        require(block.number >= prop.deadline);
        require(prop.state == proposalState.VOTING);
        
        if (prop.voteSum > 0) {
            require(prop.budget <= availableFunds()); // cannot spend more money than community has
            prop.state = proposalState.APPROVED;
            lockedFunds += prop.budget;
        } else {
            // failed TODO what do we do here?
            prop.state = proposalState.DENIED;
        }
        return true;
    
    }

}
